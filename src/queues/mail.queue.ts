import path from "path";
import { promises as fs } from "fs";
import Handlebars from 'handlebars';
import Bull, { Job, Queue } from "bull";
import { MailService } from "../services/mails/mails.service";
import { connectionRedis } from "../../configuration/redis";
import { OrderInterface } from "../interfaces/orders.interface";

export class EmailQueueService {
  private queue: Queue<{ to: string; subject: string; html: string }>;
  private mailService: MailService;

  constructor() {
    this.mailService = new MailService();

    this.queue = new Bull("emailQueue", { redis: connectionRedis });

    // Procesar los correos en la cola
    this.queue.process("sendEmail", async (job: Job) => {
      const { to, subject, html } = job.data;
      await this.sendEmail(to, subject, html);
    });

    this.setupListeners();
  }

  /**
   * Agrega un correo a la cola
   */
  public async addToQueue(
    order: OrderInterface,
    typeEmail = "order"
  ): Promise<void> {
    try {
      // prepare html
      let html = ``;
      let subject = '';
      const templatePath = path.join(
        __dirname,
        "../templates/mails"
      );

      let emailData = {
        firstName: order.client.firstName || '',
        lastName: order.client.lastName || '',
        _id: order._id || '',
        address: order.client.address || '',
        city: order.client.city || '',
        state_shipping: order.client.state || '',
        total: order.total || 0,
        name_vehicle: order.vehicleDetails ? order.vehicleDetails.name : '',
        model_vehicle: order.vehicleDetails ? order.vehicleDetails.model : '',
        image_vehicle: order.vehicleDetails ? order.vehicleDetails.image : '',
        serviceDate: order.serviceDate || '',
        serviceTime: order.serviceTime || '',
        products: order.items.map(p => ({
          name: p.name,
          quantity: p.quantity,
          price: p.purchasePrice,
          image: p.image || '' // Asegurar que siempre haya una cadena
        })),
        state: order.status
      };

      if (typeEmail === "order" && order.type === 'Sales Order') {
        html = await fs.readFile(`${templatePath}/order.mail.html`, "utf-8");
        subject = `¡Pedido Recibido #${order._id}! 📦`;
      }

      if (typeEmail === "order" && order.type === 'Test Drive Request') {
        html = await fs.readFile(`${templatePath}/driver.mail.html`, "utf-8");
        subject = "¡Solicitud de manejo! 🏍️";
      }
      // Compilar plantilla con Handlebars
      const template = Handlebars.compile(html);
      html = template(emailData);

      // send email procees to the queue
      await this.queue.add("sendEmail", {
        to: order.client.email,
        subject,
        html,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Envía un correo con `MailService`
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    try {
      await this.mailService.sendEmail(to, subject, html);
    } catch (error) {
      console.error(`❌ Error enviando correo a ${to}:`, error);
    }
  }

  /**
   * Configura eventos de la cola
   */
  private setupListeners() {
    this.queue.on("completed", (job: Job) => {
      console.log(`✅ Correo enviado correctamente: ${job.id}`);
    });

    this.queue.on("failed", (job: Job, err: Error) => {
      console.error(`❌ Error en el envío del correo ${job.id}:`, err);
    });
  }
}
