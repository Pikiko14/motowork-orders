import { Response } from "express";
import { MailService } from "./mails/mails.service";
import { RedisImplement } from "./cache/redis.services";
import { EmailQueueService } from "../queues/mail.queue";
import { ResponseHandler } from "../utils/responseHandler";
import { PaymentFactory } from "./payments/payment.factory";
import OrdersRepository from "../repositories/orders.repository";
import { PaginationInterface } from "../interfaces/req-ext.interface";
import {
  OrderInterface,
  OrdersStatusInterface,
} from "../interfaces/orders.interface";
import configuration from "../../configuration/configuration";
export class OrdersService extends OrdersRepository {
  statusAvailable: any = {
    approved: "Pago Completado",
    pending: "Pago en estado pendiente",
    in_process: "En proceso de pago",
    in_mediation: "En proceso de pago",
    rejected: "Pago Rechazado",
    cancelled: "Pago Cancelado",
    refunded: "Devolución de Fondos",
    chargedback: "Devolución de Fondos",
  };
  emailService = new MailService();

  constructor() {
    super();
  }

  /**
   * Create orders
   * @param { Response } res Express response
   * @param { BrandsInterface } body BrandsInterface
   */
  public async createOrders(
    res: Response,
    body: OrderInterface
  ): Promise<void | ResponseHandler> {
    try {
      // validate file
      const order = (await this.create(body)) as OrderInterface;

      // delete keys from cache
      await this.clearCacheInstances();

      // send email
      const emailQueueService = new EmailQueueService();
      emailQueueService.addToQueue(order, "order");

      // return response
      return ResponseHandler.successResponse(
        res,
        order,
        "Orden creada correctamente."
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Init payment process
   * @param { Response } res
   * @param body
   * @param { string } id
   * @returns
   */
  public async initPayment(
    res: Response,
    body: any,
    id: string
  ): Promise<void | ResponseHandler> {
    try {
      // validate file
      const order = (await this.findOneByQuery({ _id: id })) as OrderInterface;

      // init payment process
      const paymentGateway = PaymentFactory.createPaymentGateway(
        body.payment_methods || "mercadopago"
      );
      const preference = await paymentGateway.processPayment(order);

      if (preference && body.payment_methods) {
        order.payment_method = body.payment_methods;
        order.status = "Pendiente";
        await this.update(id, order);
        await this.clearCacheInstances();
      }

      // return response
      return ResponseHandler.successResponse(
        res,
        {
          order,
          preference,
        },
        "Proceso de pago inicializado correctamente."
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Show order data
   * @param { Response } res
   * @param { string } id
   * @returns
   */
  public async showOrder(
    res: Response,
    id: string
  ): Promise<void | ResponseHandler> {
    try {
      // validate order
      const redisCache = RedisImplement.getInstance();
      const cacheKey = `orders:${id}`;
      const orderInCache = await redisCache.getItem(cacheKey);
      if (orderInCache) {
        return ResponseHandler.successResponse(
          res,
          orderInCache,
          "Datos de la orden"
        );
      }

      // get order
      const order = await this.findById(id);

      await redisCache.setItem(cacheKey, order, 300);

      // return response
      return ResponseHandler.successResponse(res, order, "Datos de la orden.");
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Validate payment
   * @param { Response } res
   * @param { string } paymentId
   * @returns
   */
  public async validatePayment(res: Response, paymentId: any) {
    try {
      // get order
      const paymentGateway = PaymentFactory.createPaymentGateway("mercadopago");
      const paymentData = await paymentGateway.getPaymentData(paymentId);

      // validate order status
      const {
        external_reference,
        status,
        status_detail,
        money_release_status,
      } = paymentData;

      // get order to update
      const order = await this.findById(external_reference as string);

      // cambiamos el estado de la orden.
      if (
        order &&
        status_detail === "accredited" &&
        money_release_status === "released"
      ) {
        await this.clearCacheInstances();
        if (!order.payment_data.date_approved) {
          order.payment_data = {
            date_approved: paymentData.date_approved || null,
            date_created: paymentData.date_created || null,
            status: paymentData.status || null,
            status_detail: paymentData.status_detail || null,
            card: {
              last_four_digits: paymentData.card
                ? paymentData.card.last_four_digits
                : null,
            },
          };
        }
      }
      if (order && status) {
        order.status = this.statusAvailable[status];
        await this.update(external_reference, order);
      }

      // delete keys from cache
      await this.clearCacheInstances();

      // return response
      return ResponseHandler.successResponse(
        res,
        paymentId,
        "Se ha validado el pago en la orden."
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * List order with Redis Cache
   * @param { Response } res
   * @param { PaginationInterface } query
   */
  public async listOrders(res: Response, query: PaginationInterface) {
    try {
      // validate from cache
      const redisCache = RedisImplement.getInstance();
      const cacheKey = `orders:${JSON.stringify(query)}`;
      const cachedData = await redisCache.getItem(cacheKey);
      if (cachedData) {
        return ResponseHandler.successResponse(
          res,
          cachedData,
          "Listado de products (desde caché)."
        );
      }

      // Validar datos de paginación
      const page: number = (query.page as number) || 1;
      const perPage: number = (query.perPage as number) || 7;
      const skip = (page - 1) * perPage;

      // Construir el query de búsqueda
      let queryObj: any = {};
      if (query.search) {
        const searchRegex = new RegExp(query.search as string, "i");
        queryObj = {
          $or: [
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$_id" },
                  regex: query.search,
                  options: "i",
                },
              },
            },
            { "client.dni": searchRegex },
            { "client.email": searchRegex },
            { "client.lastName": searchRegex },
            { "client.firstName": searchRegex },
            { "client.phone": searchRegex },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: ["$client.firstName", " ", "$client.lastName"],
                  },
                  regex: query.search,
                  options: "i",
                },
              },
            },
          ],
        };
      }

      // Filtrar por tipo de producto
      if (query.type) {
        queryObj.type = query.type;
      }

      // Validar filtro por fecha
      if (query.filter) {
        const filter = JSON.parse(query.filter);
        if (filter.from || filter.to) {
          queryObj.createdAt = {};
          if (filter.from) queryObj.createdAt.$gte = new Date(filter.from);
          if (filter.to) queryObj.createdAt.$lte = new Date(filter.to);
        }
      }

      // Ejecutar consulta a la base de datos
      const fields = query.fields ? query.fields.split(",") : [];
      const products = await this.paginate(
        queryObj,
        skip,
        perPage,
        query.sortBy,
        query.order,
        fields
      );

      // Guardar la respuesta en Redis por 10 minutos
      await redisCache.setItem(
        cacheKey,
        {
          orders: products.data,
          totalItems: products.totalItems,
          totalPages: products.totalPages,
        },
        600
      );

      // Retornar la respuesta
      return ResponseHandler.successResponse(
        res,
        {
          orders: products.data,
          totalItems: products.totalItems,
          totalPages: products.totalPages,
        },
        "Listado de products."
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Count order
   * @param { Response } res
   * @param { string } paymentId
   * @returns
   */
  public async countOrders(res: Response) {
    try {
      // get count
      const redisCache = RedisImplement.getInstance();

      // validate cache
      const loadedFromCache = await redisCache.getItem("orders:count");
      if (loadedFromCache) {
        return ResponseHandler.successResponse(
          res,
          loadedFromCache,
          "Total de ordenes registradas sacadas desde cache."
        );
      }

      // from bbdd
      const count = await this.getCountOrders();
      redisCache.setItem("orders:count", count, 600);

      // return response
      return ResponseHandler.successResponse(
        res,
        count,
        "Total de ordenes registradas."
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // clear cache instances
  public async clearCacheInstances() {
    const redisCache = RedisImplement.getInstance();
    const keys = await redisCache.getKeys("orders:*");
    if (keys.length > 0) {
      await redisCache.deleteKeys(keys);
      console.log(`🗑️ Cache limpiado`);
    }
  }

  /**
   * Update order status
   * @param res
   * @param body
   * @param id
   * @returns
   */
  public async updateOrderStatus(
    res: Response,
    body: OrdersStatusInterface,
    id: string
  ) {
    try {
      // update order
      const order = (await this.findById(id)) as OrderInterface;
      order.status = body.status;
      const newOrder = await this.update(id, order);

      // clear cache
      await this.clearCacheInstances();

      // return response
      return ResponseHandler.successResponse(
        res,
        newOrder,
        "Estado de la orden modificado correctamente."
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * get most sell items
   * @param { Response } res
   * @returns
   */
  async mostSells(res: Response) {
    try {
      // get from cache
      const redisCache = RedisImplement.getInstance();

      const loadedFromCache = await redisCache.getItem("most-product-sells");
      if (loadedFromCache) {
        return ResponseHandler.successResponse(
          res,
          loadedFromCache,
          "Productos mas vendidos (Desde cache)."
        );
      }

      // most sellers
      const mostSells: any[] = await this.mostSellsProducts();
      const sku = mostSells.map((el) => el.sku);
      const urlProduct = `${configuration.get('API_URL')}/api/v1/products/most-sells/from-web?products=${sku.join(',')}`;

      // get product data
      const request = await fetch(urlProduct);
      const data = await request.json();
      let mostSellProducts = [];

      if (data && data.success) {
        mostSellProducts = data.data;
      }
      
      // guardamos en redis
      if (mostSellProducts && mostSellProducts.length > 0 ) {
        // Guardar la respuesta en Redis por 10 minutos
        await redisCache.setItem(
          "most-product-sells",
          mostSellProducts,
          600
        );
      }

      // return response
      return ResponseHandler.successResponse(
        res,
        mostSellProducts,
        "Productos mas vendidos."
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
