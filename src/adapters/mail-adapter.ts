export interface sendMailData {
  subject: string;
  body: string;
}

export interface mailAdapters {
  sendMail: (data: sendMailData) => Promise<void>;
}
