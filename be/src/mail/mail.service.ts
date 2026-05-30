import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { SendMailOptions, Transporter } from "nodemailer";

@Injectable()
export class MailService {
  private transporter?: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async sendMail(options: SendMailOptions) {
    const from = options.from ?? this.configService.get<string>("smtp.from");

    return this.getTransporter().sendMail({
      ...options,
      from,
    });
  }

  async verifyConnection(): Promise<boolean> {
    return this.getTransporter().verify();
  }

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get<string>("smtp.host");
    if (!host) {
      throw new InternalServerErrorException("SMTP_HOST is not configured");
    }

    const user = this.configService.get<string>("smtp.user");
    const pass = this.configService.get<string>("smtp.pass");

    this.transporter = nodemailer.createTransport({
      host,
      port: this.configService.get<number>("smtp.port") ?? 587,
      secure: this.configService.get<boolean>("smtp.secure") ?? false,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.transporter;
  }
}
