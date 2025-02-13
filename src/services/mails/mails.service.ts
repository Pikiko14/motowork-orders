import nodemailer, { Transporter } from "nodemailer";

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      requireTLS: false,
    });
  }

  /**
   * Enviar un correo electrónico
   * @param to Destinatario del correo
   * @param subject Asunto del correo
   * @param html Contenido en HTML
   */
  public async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.MOTOWORK_EMAIL,
        to,
        subject,
        html,
      });
      console.log("Correo enviado:", info.messageId);
    } catch (error) {
      console.error("Error enviando correo:", error);
    }
  }
}
