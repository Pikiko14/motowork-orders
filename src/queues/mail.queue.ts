import Bull, { Job, Queue, QueueOptions } from "bull";
import { MailService } from "../services/mails/mails.service";
import { connectionRedis } from '../../configuration/redis';

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
  public async addToQueue(to: string, subject: string, html: string): Promise<void> {
    await this.queue.add("sendEmail", { to, subject, html });
  }

  /**
   * Envía un correo con `MailService`
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {;
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
