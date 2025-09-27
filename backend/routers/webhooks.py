from fastapi import APIRouter, status, BackgroundTasks
from fastapi.responses import JSONResponse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter()

def send_merge_request_status_email(to_email: str, mr_id: str, status: str, repo_name: str, title: str):
    subject = f"Merge Request #{mr_id} Status Update: {status}"
    body = f"""
    Hello,

    The status of your merge request '{title}' in repository '{repo_name}' has changed to: {status}.
    Merge Request ID: {mr_id}

    Please check the repository for more details.

    Regards,\nOSINTHub Team
    """
    msg = MIMEMultipart()
    msg['From'] = 'noreply@osinthub.local'
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('localhost') as server:
            server.sendmail(msg['From'], [to_email], msg.as_string())
    except Exception as e:
        print(f"Failed to send email: {e}")

@router.post("/webhooks/merge-request-status")
async def notify_merge_request_status(webhook_data: dict, background_tasks: BackgroundTasks):
    """
    Webhook endpoint to notify when a merge request status changes.
    Expects webhook_data to contain at least:
      - 'merge_request_id'
      - 'status'
      - 'user_email' (to notify)
      - 'repository_name'
      - 'title' (of MR)
    """
    to_email = webhook_data.get('user_email')
    mr_id = webhook_data.get('merge_request_id')
    mr_status = webhook_data.get('status')
    repo_name = webhook_data.get('repository_name')
    title = webhook_data.get('title')
    if to_email and mr_id and mr_status and repo_name and title:
        background_tasks.add_task(
            send_merge_request_status_email, to_email, mr_id, mr_status, repo_name, title
        )
    else:
        print("Missing required fields for sending email notification.")
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Notification processed",
            "merge_request_id": mr_id,
            "status": mr_status,
            "repository_name": repo_name,
            "title": title
        }
    )
