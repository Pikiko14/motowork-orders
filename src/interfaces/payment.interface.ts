
import { OrderInterface } from "./orders.interface";
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { BankAccountInterface } from "./bank-account.interface";

// Interfaz común para todas las pasarelas de pago
export interface PaymentGateway {
  processPayment(order: OrderInterface): Promise<void | PreferenceResponse | BankAccountInterface | string>;
  getPaymentData(paymentId: any): Promise<PaymentResponse | void | any | string>;
}
