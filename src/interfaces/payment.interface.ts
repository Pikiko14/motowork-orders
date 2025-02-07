import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { OrderInterface } from "./orders.interface";

// Interfaz común para todas las pasarelas de pago
export interface PaymentGateway {
  processPayment(order: OrderInterface): Promise<void | PreferenceResponse>;
}
