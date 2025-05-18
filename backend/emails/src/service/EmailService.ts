import { Resend } from 'resend';
import { PosterDto } from '@realkoder/antik-moderne-shared-types';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

export interface UserRequest {
    name: string;
    email: string;
}

class EmailService {
    private static instance: EmailService;
    private constructor() { }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    async sendEmail({ name, email }: UserRequest) {
        const msg = {
            from: 'welcome@realkoder.com',
            to: email,
            subject: 'Welcome to Antik Moderne',
            html: `
      <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333;">
        <h2>Welcome to Antik Moderne, ${name}!</h2>
        <p>We're thrilled to have you join our community of art and poster enthusiasts. At Antik Moderne, we believe in the power of art to transform spaces and inspire lives.</p>
        <p>As a welcome gift, here's a <strong>10% discount</strong> on your first purchase! Just use the code <strong>WELCOME10</strong> at checkout.</p>
        <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@realkoder.com" style="color: #1a82e2;">support@realkoder.com</a>.</p>
        <p>Thank you for choosing Antik Moderne. Let's make your space beautiful together!</p>
        <p>Warm regards,<br>The Antik Moderne Team xD</p>
      </div>
    `
        };

        try {
            await resend.emails.send(msg);
        } catch (error) {
            console.error(error);
        }
    }

    async sendProductAddedEmail(addedProduct: PosterDto) {
        const msg = {
            from: 'welcome@realkoder.com',
            to: "alexanderbtcc@gmail.com",
            subject: 'Welcome to Antik Moderne',
            html: `
      <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333;">
        <h2>Exciting News, ALEXANDER!!!</h2>
        <p>We've just added a new poster to your collection: <strong>${addedProduct.title}</strong>.</p>
        <p>At Antik Moderne, we are dedicated to bringing you the best in art and design. We hope this new addition inspires you and enhances your space.</p>
        <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@realkoder.com" style="color: #1a82e2;">support@realkoder.com</a>.</p>
        <p>Thank you for being a part of the Antik Moderne community!</p>
        <p>Warm regards,<br>The Antik Moderne Team</p>
      </div>
    `
        };

        try {
            await resend.emails.send(msg);
        } catch (error) {
            console.error(error);
        }
    }

}

export default EmailService.getInstance();