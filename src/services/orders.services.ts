import { Response } from "express";
import { PaymentFactory } from "./payments/payment.factory";
import { ResponseHandler } from "../utils/responseHandler";
import { OrderInterface } from "../interfaces/orders.interface";
import OrdersRepository from "../repositories/orders.repository";

export class OrdersService extends OrdersRepository {
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
}
