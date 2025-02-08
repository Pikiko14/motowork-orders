
import { OrderInterface } from "./orders.interface";
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

// Interfaz común para todas las pasarelas de pago
export interface PaymentGateway {
  processPayment(order: OrderInterface): Promise<void | PreferenceResponse>;
  getPaymentData(paymentId: any): Promise<PaymentResponse>;
}
