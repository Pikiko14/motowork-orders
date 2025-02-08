import { PaymentGateway } from "../../interfaces/payment.interface";
import { BankTransfer } from "./implements/bank-trasnfer.implement";
import { MercadoPagoImplement } from "./implements/mercado-pago.implement";

export class PaymentFactory {
  static createPaymentGateway(gateway: string): PaymentGateway {
    switch (gateway.toLowerCase()) {
      case "mercadopago":
        return new MercadoPagoImplement();

      case "trasnferencia":
        return new BankTransfer();

      default:
        throw new Error("Pasarela de pago no soportada.");
    }
  }
}
