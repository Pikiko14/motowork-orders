import { OrderInterface } from "./orders.interface";

// Interfaz común para todas las pasarelas de pago
export interface PaymentGateway {
  processPayment(order: OrderInterface): void;
}
