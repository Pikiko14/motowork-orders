import { OrderInterface } from "../../../interfaces/orders.interface";
import { PaymentGateway } from "../../../interfaces/payment.interface";

// Implementación para MercadoPago
export class MercadoPago implements PaymentGateway {
  processPayment(order: OrderInterface): void {
    console.log(`Procesando pago de ${order.total} COP a través de MercadoPago.`);
  }
}
