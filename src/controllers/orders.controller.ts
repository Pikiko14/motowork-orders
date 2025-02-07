import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { ResponseHandler } from "../utils/responseHandler";
import { OrdersService } from "../services/orders.services";
import { OrderInterface } from "../interfaces/orders.interface";

export class OrdersController {
  public service;

  constructor() {
    this.service = new OrdersService();
  }

  /**
   * Create orders
   * @param req Express request
   * @param res Express response
   * @returns Promise<void>
   */
  createOrders = async (
    req: Request,
    res: Response
  ): Promise<void | ResponseHandler> => {
    try {
      // get body
      const body = matchedData(req);

      // store order
      return await this.service.createOrders(res, body as OrderInterface);
    } catch (error: any) {
      ResponseHandler.handleInternalError(res, error, error.message ?? error);
    }
  };

  /**
   * Init order payment
   * @param req Express request
   * @param res Express response
   * @returns Promise<void>
   */
  initPayment = async (
    req: Request,
    res: Response
  ): Promise<void | ResponseHandler> => {
    try {
      // get body
      const body = matchedData(req);
      const { id } = req.params;

      // store order
      return await this.service.initPayment(res, body, id);
    } catch (error: any) {
      ResponseHandler.handleInternalError(res, error, error.message ?? error);
    }
  };
}
