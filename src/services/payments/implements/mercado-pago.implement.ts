import { MercadoPagoConfig, Preference } from 'mercadopago';
import configuration from "../../../../configuration/configuration";
import { PaymentGateway } from "../../../interfaces/payment.interface";
import { Item, OrderInterface } from "../../../interfaces/orders.interface";
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

// Implementación para MercadoPago
export class MercadoPagoImplement implements PaymentGateway {
  client: MercadoPagoConfig;
  preference: Preference;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: configuration.get('MERCADO_PAGO_PRIVATE_KEY')
    })
    this.preference = new Preference(this.client);
  }

  async processPayment(order: OrderInterface): Promise<PreferenceResponse> {
    const items = order.items.map((item: Item) => {
      return {
        id: item._id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.purchasePrice
      }
    })

    const createPreference = await this.preference.create({
      "body": {
        items: items,
        payer: {
          name: order.client.firstName,
          surname: order.client.lastName,
          email: order.client.email,
          phone: {
            area_code: '57',
            number: order.client.phone.split(' ').join('')
          },
          address: {
            street_name: order.client.address,
          }
        },
        back_urls: {
          "success": `${configuration.get('APP_URL')}/orden-de-compra/${order._id}/aprobada`,
          "pending": `${configuration.get('APP_URL')}/orden-de-compra/${order._id}/pendiente`,
          "failure": `${configuration.get('APP_URL')}/orden-de-compra/${order._id}/fallo`,
        },
        external_reference: order._id,
        payment_methods: {
          installments: 1,
        }
      }
    })

    return createPreference;
  }
}
