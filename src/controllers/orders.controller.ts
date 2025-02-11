import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { ResponseHandler } from "../utils/responseHandler";
import { OrdersService } from "../services/orders.services";
import { OrderInterface } from "../interfaces/orders.interface";
import { PaginationInterface } from "../interfaces/req-ext.interface";

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

      // init pay,ent order
      return await this.service.initPayment(res, body, id);
    } catch (error: any) {
      ResponseHandler.handleInternalError(res, error, error.message ?? error);
    }
  };

   /**
   * Show order
   * @param req Express request
   * @param res Express response
   * @returns Promise<void>
   */
  showOrder = async (
    req: Request,
    res: Response
  ) => {
    try {
      // get body
      const { id } = req.params;

      // get order
      return await this.service.showOrder(res, id);
    } catch (error: any) {
      ResponseHandler.handleInternalError(res, error, error.message ?? error);
    }
  }

  /**
   * Validamos el pago desde el webhook
   * @param req 
   * @param res 
   * @returns 
   */
  validatePayment = async(req: Request, res: Response) => {
    try {
      // get body
      const { query } = req;

      if (query['data.id'] && query.type === "payment") {
        const id = query['data.id'];
        return await this.service.validatePayment(res, id);
      }

      return res.sendStatus(204);
    } catch (error: any) {
      ResponseHandler.handleInternalError(res, error, error.message ?? error);
    }
  }

  /**
   * list orders
   * @param req Express request
   * @param res Express response
   * @returns Promise<void>
   */
  listOrders = async (
    req: Request,
    res: Response
  ) => {
    try {
      // get query params// get query
      const query = matchedData(req) as PaginationInterface;

      // get order
      return await this.service.listOrders(res, query);
    } catch (error: any) {
      ResponseHandler.handleInternalError(res, error, error.message ?? error);
    }
  }
}
