import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { OrderInterface } from "../../../interfaces/orders.interface";
import { PaymentGateway } from "../../../interfaces/payment.interface";
import { BankAccountInterface } from "../../../interfaces/bank-account.interface";

export class LinkPayment implements PaymentGateway {
  paymentLink: string;

  constructor() {
    this.paymentLink = 'https://www.mipagoamigo.com/MPA_WebSite/ServicePayments/StartPayment?id=16827&searchedCategoryId=&searchedAgreementName=MOTOWORK'
  }

  async processPayment(
    order: OrderInterface
  ): Promise<void | PreferenceResponse | string> {
    return this.paymentLink;
  }

  async getPaymentData(paymentId: string): Promise<null | string> {
    return paymentId;
  }
}
