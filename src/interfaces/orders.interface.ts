export interface Item {
  name: string;
  reference: string;
  sku: string;
  purchasePrice: number;
  total: number;
  quantity: number;
  variant: any;
  image: any;
  _id?: any;
}

export interface Client {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  marketingConsent?: boolean;
  type_of_housing?: string;
  state?: string;
  postal_code?: string;
  city?: string;
  address?: string;
  dni?: string;
}

export interface VehicleDetails {
  name: string;
  model: string;
  image: string;
}

export interface OrderInterface {
  type: "Sales Order" | "Test Drive Request";
  serviceDate: string;
  serviceTime: string;
  client: Client;
  items: Item[];
  vehicleDetails: VehicleDetails;
  contact_type?: "WhatsApp" | "Teléfono";
  conveyor?: string;
  shippingMethod?: string;
  total?: number;
  subtotal?: number;
  createdAt?: Date;
  status:
    | "Pendiente"
    | "Pago Completado"
    | "Pago Cancelado"
    | "Pago Rechazado"
    | "En proceso de pago"
    | "Pago en estado pendiente"
    | "Pago en proceso"
    | "Devolución de Fondos";
  dni?: string;
  _id?: string;
  payment_method?: string;
  payment_data?: any;
}
