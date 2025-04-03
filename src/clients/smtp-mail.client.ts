import * as nodemailer from "nodemailer";
import { EmailOptions } from "../types/smtp-types";
import { config } from "../config";

export class SMTPMailClient {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(config.smtp);
  }

  private formatMailOptions(options: EmailOptions): nodemailer.SendMailOptions {
    const toEmails = this.formatEmailList(options.toEmail);
    const ccEmails = options.ccEmail
      ? this.formatEmailList(options.ccEmail)
      : undefined;
    const bccEmails = options.bccEmail
      ? this.formatEmailList(options.bccEmail)
      : undefined;

    return {
      from: options.fromName
        ? `"${options.fromName}" <${options.fromEmail}>`
        : `${options.fromEmail}`,
      to: toEmails,
      cc: ccEmails,
      bcc: bccEmails,
      subject: options.subject,
      html: options.body,
    };
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = this.formatMailOptions(options);

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      return true;
    } catch (error: any) {
      console.error("Error sending email:", error.message);
      return false;
    }
  }

  private formatEmailList(emails: string | string[]): string {
    if (Array.isArray(emails)) {
      return emails.join(", ");
    }

    return emails;
  }
}
