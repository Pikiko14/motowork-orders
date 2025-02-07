export interface Item {
  name: string;
  reference: string;
  sku: string;
  purchasePrice: number;
  total: number;
  quantity: number;
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
  status: "Pendiente" | "Completado" | "Cancelado" | "Rechazado";
  dni?: string;
}
