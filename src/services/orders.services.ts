import { Response } from "express";
import { PaymentFactory } from "./payments/payment.factory";
import { ResponseHandler } from "../utils/responseHandler";
import { OrderInterface } from "../interfaces/orders.interface";
import OrdersRepository from "../repositories/orders.repository";
import { PaginationInterface } from "../interfaces/req-ext.interface";

export class OrdersService extends OrdersRepository {
  statusAvailable: any = {
    approved: 'Pago Completado',
    pending: 'Pago en estado pendiente',
    in_process: 'En proceso de pago',
    in_mediation: 'En proceso de pago',
    rejected: 'Pago Rechazado',
    cancelled: 'Pago Cancelado',
    refunded: 'Devolución de Fondos',
    chargedback: 'Devolución de Fondos'
  }

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
        order.status = 'Pendiente';
        await this.update(id, order);
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
      // get order
      const order = await this.findById(id);
      
      // return response
      return ResponseHandler.successResponse(
        res,
        order,
        "Datos de la orden."
      );
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
      const paymentGateway = PaymentFactory.createPaymentGateway('mercadopago');
      const paymentData = await paymentGateway.getPaymentData(paymentId);
      
      // validate order status
      const { external_reference, status, status_detail, money_release_status } = paymentData;

      // get order to update
      const order = await this.findById(external_reference as string);

      // cambiamos el estado de la orden.
      if (order && status_detail === 'accredited' && money_release_status === 'released') {
        if (!order.payment_data.date_approved) {
          order.payment_data = {
            date_approved: paymentData.date_approved || null,
            date_created: paymentData.date_created || null,
            status: paymentData.status || null,
            status_detail: paymentData.status_detail || null,
            card: {
              last_four_digits: paymentData.card ? paymentData.card.last_four_digits : null
            }
          }
        }
      }
      if (order && status) {
        order.status = this.statusAvailable[status];
        await this.update(external_reference, order);
      }
      
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
   * List order
   * @param { Response } Response
   * @param { PaginationInterface } query
   */
  public async listOrders(res: Response, query: PaginationInterface) {
    try {
      // validamos la data de la paginacion
      const page: number = (query.page as number) || 1;
      const perPage: number = (query.perPage as number) || 7;
      const skip = (page - 1) * perPage;

      // Iniciar busqueda
      let queryObj: any = {};
      if (query.search) {
        const searchRegex = new RegExp(query.search as string, "i");
        queryObj = {
          $or: [{ name: searchRegex }],
        };
      }

      // type products
      if (query.type) {
        queryObj.type = query.type;
      }

      // do query
      const fields = query.fields ? query.fields.split(",") : [];
      const products = await this.paginate(
        queryObj,
        skip,
        perPage,
        query.sortBy,
        query.order,
        fields
      );

      // return data
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
}
