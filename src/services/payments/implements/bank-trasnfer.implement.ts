import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { OrderInterface } from "../../../interfaces/orders.interface";
import { PaymentGateway } from "../../../interfaces/payment.interface";
import { BankAccountInterface } from "../../../interfaces/bank-account.interface";

export class BankTransfer implements PaymentGateway {
  account: BankAccountInterface;

  constructor() {
    this.account = {
        account_number: '123456789',
        account_document: '5181564614',
        account_holder: 'Motowork'
    }
  }

  async processPayment(
    order: OrderInterface
  ): Promise<void | PreferenceResponse | BankAccountInterface> {
    return this.account;
  }

  async getPaymentData(paymentId: string): Promise<null | string> {
    return paymentId;
  }
}
