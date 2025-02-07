import { MercadoPagoImplement } from "./implements/mercado-pago.implement";
import { PaymentGateway } from "../../interfaces/payment.interface";

export class PaymentFactory {
  static createPaymentGateway(gateway: string): PaymentGateway {
    switch (gateway.toLowerCase()) {
      case "mercadopago":
        return new MercadoPagoImplement();

      default:
        throw new Error("Pasarela de pago no soportada.");
    }
  }
}
