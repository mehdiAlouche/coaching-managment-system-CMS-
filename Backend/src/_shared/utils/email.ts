/**
 * Email Service Utility
 * 
 * Supports multiple email providers:
 * - SMTP (Gmail, Outlook, custom servers)
 * - SendGrid
 * - AWS SES
 * - Mailgun
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

// Singleton transporter instance
let transporter: Transporter | null = null;

/**
 * Initialize email transporter based on environment configuration
 */
function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // If no email config in development, use ethereal (test email service)
  if (isDevelopment && !process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY) {
    console.log('⚠️  No email configuration found. Emails will be logged to console only.');
    // Return a dummy transporter for development
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
    return transporter;
  }

  // SendGrid configuration (API key)
  if (process.env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
    return transporter;
  }

  // Standard SMTP configuration (Gmail, Outlook, custom)
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Fallback: log-only transporter
  console.warn('⚠️  Email service not properly configured. Emails will be logged only.');
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
  return transporter;
}

/**
 * Send an email
 * @param options Email configuration
 * @returns Promise indicating success/failure
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  try {
    const transport = getTransporter();
    const fromAddress = process.env.EMAIL_FROM || 'noreply@coaching-system.com';

    const mailOptions = {
      from: fromAddress,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    // In development without proper config, just log
    if (isDevelopment && !process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY) {
      console.log('📧 Email (DEV MODE - not sent):', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!options.html,
        hasAttachments: !!options.attachments?.length,
      });
      return true;
    }

    // Send email
    const info = await transport.sendMail(mailOptions);
    
    if (isDevelopment) {
      console.log('✅ Email sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        messageId: info.messageId,
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    
    // In development, don't throw - just log
    if (isDevelopment) {
      console.log('📧 Email details (failed to send):', {
        to: options.to,
        subject: options.subject,
      });
      return false;
    }
    
    // In production, rethrow the error
    throw error;
  }
}

/**
 * Send invoice email with PDF attachment
 */
export async function sendInvoiceEmail(
  recipientEmail: string,
  recipientName: string,
  invoiceNumber: string,
  pdfBuffer: Buffer,
  organizationName?: string
): Promise<boolean> {
  const subject = `Invoice ${invoiceNumber} from ${organizationName || 'Coaching Management System'}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Invoice ${invoiceNumber}</h2>
      <p>Dear ${recipientName},</p>
      <p>Please find attached your invoice <strong>${invoiceNumber}</strong>.</p>
      <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        ${organizationName || 'Coaching Management System'}<br>
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  const text = `
    Invoice ${invoiceNumber}
    
    Dear ${recipientName},
    
    Please find attached your invoice ${invoiceNumber}.
    
    If you have any questions about this invoice, please don't hesitate to contact us.
    
    ${organizationName || 'Coaching Management System'}
  `;

  return sendEmail({
    to: recipientEmail,
    subject,
    text,
    html,
    attachments: [
      {
        filename: `invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}
