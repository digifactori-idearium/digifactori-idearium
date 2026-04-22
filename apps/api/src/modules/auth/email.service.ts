import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? 'blessingtutka298@gmail.com';

export class EmailService {
  /**
   * Sends a password reset link to the user.
   *
   * @param to    - Recipient email address
   * @param token - The signed JWT reset token
   */
  static async sendPasswordReset(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous. Il est valable <strong>1 heure</strong>.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      `,
    });
  }

  /**
   * Sends a welcome email to a newly created intern/supervisor with their temporary password.
   *
   * @param to                - Recipient email address
   * @param pseudo            - The user's pseudo
   * @param temporaryPassword - The plain temporary password generated at creation
   */
  static async sendWelcome(
    to: string,
    pseudo: string,
    temporaryPassword: string
  ): Promise<void> {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Bienvenue — vos identifiants de connexion',
      html: `
        <p>Bonjour <strong>${pseudo}</strong>,</p>
        <p>Votre compte a été créé. Voici vos identifiants temporaires :</p>
        <ul>
          <li><strong>Email :</strong> ${to}</li>
          <li><strong>Mot de passe :</strong> ${temporaryPassword}</li>
        </ul>
        <p>Connectez-vous et changez votre mot de passe dès que possible.</p>
        <a href="${process.env.CLIENT_URL ?? 'digifactori-idearium.netlify.app'}/login">Se connecter</a>
      `,
    });
  }
}
