import { Schema, model } from "mongoose";
import { OrderInterface } from "../interfaces/orders.interface";

const ItemSchema = new Schema({
  name: { type: String, required: true },
  reference: { type: String, required: true },
  sku: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  total: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const ClientSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  marketingConsent: { type: Boolean, default: false },
  type_of_housing: { type: String, required: false },
  state: { type: String, required: false },
  postal_code: { type: String, required: false },
  city: { type: String, required: false },
  address: { type: String, required: false },
  dni: { type: String, required: false },
});

const VehicleDetailsSchema = new Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  image: { type: String, required: true },
});

const OrderSchema = new Schema<OrderInterface>(
  {
    type: {
      type: String,
      enum: ["Sales Order", "Test Drive Request"],
      required: true,
    },
    serviceDate: { type: String, required: false },
    serviceTime: { type: String, required: false },
    client: { type: ClientSchema, required: true },
    items: { type: [ItemSchema], required: true },
    vehicleDetails: { type: VehicleDetailsSchema, required: false },
    contact_type: {
      type: String,
      enum: ["WhatsApp", "Teléfono"],
      default: "WhatsApp",
      required: false,
    },
    conveyor: { type: String, required: false },
    shippingMethod: { type: String, default: "delivery" },
    total: { type: Number, required: false },
    subtotal: { type: Number, required: false },
    status: {
      type: String,
      enum: ["Pendiente", "Completado", "Cancelado", "Rechazado"],
      required: true,
      default: "Pendiente",
    },
    dni: { type: String, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// generate model
const OrderModel = model<OrderInterface>("orders", OrderSchema);

export default OrderModel;
