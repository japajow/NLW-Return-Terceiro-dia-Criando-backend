import { mailAdapters, sendMailData } from "../mail-adapter";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "90115892bea204",
    pass: "66a901aae737c7",
  },
});

export class NodemailerMailAdapter implements mailAdapters {
  async sendMail({ subject, body }: sendMailData) {
    await transport.sendMail({
      from: "Equipe Feedget <oi@feedget.com>",
      to: "Bruno Hamawaki <zapnovinhas@gmail.com>",
      subject,
      html: body,
    });
  }
}
