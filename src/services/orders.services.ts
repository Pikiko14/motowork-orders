import { Response } from "express";
import { PaymentFactory } from "./payments/payment.factory";
import { ResponseHandler } from "../utils/responseHandler";
import { OrderInterface } from "../interfaces/orders.interface";
import OrdersRepository from "../repositories/orders.repository";

export class OrdersService extends OrdersRepository {

  constructor(
  ) {
    super();
  }

  /**
   * Create orders
   * @param { Response } res Express response
   * @param { BrandsInterface } body BrandsInterface
   */
  public async createOrders(
    res: Response,
    body: OrderInterface,
  ): Promise<void | ResponseHandler> {
    try {
      // validate file
      const order = (await this.create(body)) as OrderInterface;

      // init payment process
      const paymentGateway = PaymentFactory.createPaymentGateway('mercadopago');
      paymentGateway.processPayment(order);

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
}
