from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings
from typing import List
import logging

logger = logging.getLogger(__name__)

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=settings.mail_use_credentials,
    VALIDATE_CERTS=settings.mail_validate_certs
)

async def send_verification_email(email: str, username: str, verification_token: str):
    """
    Send email verification link to user

    Args:
        email: User's email address
        username: User's username
        verification_token: Verification token to include in link
    """
    try:
        # Create verification URL
        verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"

        # Email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #2563eb; margin-bottom: 20px;">Welcome to Bonsai! 🌳</h2>

                    <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                        Hi <strong>{username}</strong>,
                    </p>

                    <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                        Thank you for registering with Bonsai Task Manager!
                        Please verify your email address to complete your registration.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verification_url}"
                           style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background-color: #f9fafb; padding: 10px; border-radius: 4px;">
                        {verification_url}
                    </p>

                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                        This link will expire in 24 hours.
                    </p>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                    <p style="font-size: 12px; color: #9ca3af;">
                        If you didn't create this account, please ignore this email.
                    </p>
                </div>
            </body>
        </html>
        """

        # Plain text version
        text_body = f"""
        Welcome to Bonsai Task Manager!

        Hi {username},

        Thank you for registering! Please verify your email address by clicking the link below:

        {verification_url}

        This link will expire in 24 hours.

        If you didn't create this account, please ignore this email.
        """

        message = MessageSchema(
            subject="Verify Your Email - Bonsai Task Manager",
            recipients=[email],
            body=text_body,
            html=html_body,
            subtype=MessageType.html
        )

        # Send email if mail is configured
        if settings.mail_enabled:
            fm = FastMail(conf)
            await fm.send_message(message)
            logger.info(f"Verification email sent to {email}")
        else:
            # In development, just log the verification URL
            logger.info(f"Email sending disabled. Verification URL: {verification_url}")
            print(f"\n{'='*80}")
            print(f"EMAIL VERIFICATION (Development Mode)")
            print(f"{'='*80}")
            print(f"To: {email}")
            print(f"Username: {username}")
            print(f"Verification Link: {verification_url}")
            print(f"{'='*80}\n")

    except Exception as e:
        logger.error(f"Failed to send verification email: {str(e)}")
        # Don't fail registration if email fails
        print(f"Warning: Could not send verification email to {email}")

async def send_password_reset_email(email: str, username: str, reset_token: str):
    """
    Send password reset link to user

    Args:
        email: User's email address
        username: User's username
        reset_token: Password reset token
    """
    try:
        reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"

        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #dc2626;">Password Reset Request</h2>

                    <p>Hi <strong>{username}</strong>,</p>

                    <p>We received a request to reset your password. Click the button below to reset it:</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}"
                           style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #6b7280;">
                        This link will expire in 1 hour.
                    </p>

                    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">
                        If you didn't request this, please ignore this email.
                    </p>
                </div>
            </body>
        </html>
        """

        message = MessageSchema(
            subject="Password Reset - Bonsai Task Manager",
            recipients=[email],
            body=f"Reset your password: {reset_url}",
            html=html_body,
            subtype=MessageType.html
        )

        if settings.mail_enabled:
            fm = FastMail(conf)
            await fm.send_message(message)
            logger.info(f"Password reset email sent to {email}")
        else:
            logger.info(f"Email sending disabled. Reset URL: {reset_url}")
            print(f"\n{'='*80}")
            print(f"PASSWORD RESET (Development Mode)")
            print(f"{'='*80}")
            print(f"To: {email}")
            print(f"Reset Link: {reset_url}")
            print(f"{'='*80}\n")

    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")
