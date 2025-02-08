import { check } from "express-validator";
import { NextFunction, Response, Request } from "express";
import { handlerValidator } from "../utils/handler.validator";
import OrdersRepository from "../repositories/orders.repository";

const repository = new OrdersRepository();

const ordersCreationValidator = [
  check("type")
    .isIn(["Sales Order", "Test Drive Request"])
    .withMessage(
      'Tipo de orden inválido. Debe ser "Sales Order" o "Test Drive Request".'
    ),
  check("serviceDate")
    .optional()
    .isString()
    .withMessage("La fecha del servicio es obligatoria.")
    .isLength({ min: 1, max: 16 })
    .withMessage(
      "La fecha del servicio debe tener entre 1 y máximo 16 caracteres."
    ),
  check("serviceTime")
    .optional()
    .isString()
    .withMessage("La hora del servicio es obligatoria.")
    .isLength({ min: 1, max: 8 })
    .withMessage(
      "La fecha del servicio debe tener entre 1 y máximo 8 caracteres."
    ),
  check("client.firstName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio.")
    .isLength({ min: 1, max: 30 })
    .withMessage("La nombre debe tener entre 1 y máximo 30 caracteres."),
  check("client.lastName")
    .notEmpty()
    .withMessage("El apellido del cliente es obligatorio.")
    .isLength({ min: 1, max: 30 })
    .withMessage("La apellido debe tener entre 1 y máximo 30 caracteres."),
  check("client.phone")
    .notEmpty()
    .withMessage("Debes especificar el teléfono del cliente")
    .matches(/^\d{3} \d{4} \d{3}$/)
    .withMessage(
      'El teléfono del cliente debe tener el formato "322 5632 236".'
    ),
  check("client.email")
    .notEmpty()
    .withMessage("Debes especificar el correo del cliente")
    .isEmail()
    .withMessage(
      "El correo del cliente debe ser una dirección de correo válida."
    ),
  check("client.marketingConsent")
    .optional()
    .isBoolean()
    .withMessage("El marketing consentimiento debe ser booleano"),
  check("client.type_of_housing")
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage("El tipo de casa debe tener entre 1 y máximo 30 caracteres."),
  check("client.state")
    .optional()
    .isLength({ min: 1, max: 60 })
    .withMessage("El departamento debe tener entre 1 y máximo 60 caracteres."),
  check("client.postal_code").optional(),
  check("client.city")
    .optional()
    .isLength({ min: 1, max: 60 })
    .withMessage("La Ciudad debe tener entre 1 y máximo 30 caracteres."),
  check("client.address")
    .optional()
    .isLength({ min: 1, max: 90 })
    .withMessage("La dirección debe tener entre 1 y máximo 90 caracteres."),
  check("client.dni")
    .optional()
    .isLength({ min: 1, max: 15 })
    .withMessage("La cédula debe tener entre 1 y máximo 15 caracteres."),
  check("items")
    .optional()
    .isArray()
    .withMessage("Los artículos deben ser un arreglo si se proporcionan."),
  check("vehicleDetails")
    .optional()
    .isObject()
    .withMessage(
      "Los detalles del vehículo deben ser un objeto si se proporcionan."
    ),
  check("vehicleDetails.name")
    .optional()
    .isString()
    .withMessage("El nombre del vehiculo debe ser un string"),
  check("vehicleDetails.model")
    .optional()
    .isString()
    .withMessage("El modelo del vehiculo debe ser un string"),
  check("contact_type")
    .optional()
    .isIn(["WhatsApp", "Teléfono"])
    .withMessage(
      'Tipo de contacto inválido. Debe ser "WhatsApp" o "Teléfono".'
    ),
  check("conveyor")
    .optional()
    .isIn(["servientrega", "inter_rapidisimo", "coordinadora", "envia", "tcc", 'pick_on_store', null])
    .withMessage(
      "La trasnportadora debe ser una de las siguientes opciones: servientrega, inter_rapidisimo, coordinadora, envia o tcc"
    ),
  check("shippingMethod")
    .optional()
    .isIn(["delivery", "pick_on_store"])
    .withMessage("El método de envio debe ser: delivery o pick_on_store"),
  check("total").optional(),
  check("subtotal").optional(),
  check("items").optional(),
  (req: Request, res: Response, next: NextFunction) =>
    handlerValidator(req, res, next),
];

const initPaymentValidator = [
  check("payment_methods")
    .notEmpty()
    .withMessage("Debe existier el medio de pago")
    .isIn(["mercadopago", "trasnferencia"])
    .withMessage("El medio de pago debe ser mercadopago o trasnferencia."),
  check("order_id")
    .notEmpty()
    .withMessage("Debe existier el order id a pagar")
    .isMongoId()
    .withMessage("Debe ser un id correcto")
    .custom(async (val: string) => {
      const order = await repository.findById(val);
      if (!order) {
        throw new Error("La orden no existe.");
      }
    }),
  (req: Request, res: Response, next: NextFunction) =>
    handlerValidator(req, res, next),
];

export { ordersCreationValidator, initPaymentValidator };
