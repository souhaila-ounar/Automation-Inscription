export interface EmailOptions {
  fromName?: string;
  fromEmail: string;
  toEmail: string | string[];
  ccEmail?: string | string[];
  bccEmail?: string | string[];
  subject: string;
  body: string;
}
