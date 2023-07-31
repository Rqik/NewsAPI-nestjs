import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    } as SMTPTransport.Options);
  }

  async sendActivationMail({ to, link }: { to: string; link: string }) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_USER'),
      to,
      subject: `Activate profile ${this.configService.get<string>('API_URL')}`,
      text: '',
      html: `</div>
        Для активации перейдите по ссылке
        <a href="$config.apiUrl}/activate/${link}">${this.configService.get<string>(
        'API_URL',
      )}/activate/${link}</a>
        </div>`,
    });
  }
}
