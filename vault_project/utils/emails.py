from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings


def send_email(
    to_email,
    subject,
    plain_text,
    html_content=None,
):
    """
    Reusable SendGrid Email Utility
    """

    message = Mail(
        from_email=settings.EMAIL_FROM,
        to_emails=to_email,
        subject=subject,
        plain_text_content=plain_text,
        html_content=html_content,
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)

        print("Email sent:", response.status_code)

        return True

    except Exception as e:
        print("SendGrid Error:", str(e))
        return False