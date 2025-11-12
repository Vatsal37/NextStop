# Email Verification Setup Guide

This guide explains how to configure email sending for the OTP verification feature.

## Required Environment Variables

Add the following variables to your `backend/.env` file:

```env
# Email Configuration (SMTP) - Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=nextstop.noreply@gmail.com
EMAIL_PASS=gxjqivszqjahrbah
EMAIL_FROM=nextstop.noreply@gmail.com
```

## Setting Up Email Service

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASS`

3. **Configure `.env`**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=nextstop.noreply@gmail.com
   EMAIL_PASS=gxjqivszqjahrbah
   EMAIL_FROM=nextstop.noreply@gmail.com
   ```

   **Note**: If you have 2-Step Verification enabled on your Gmail account, you'll need to use an App Password instead of your regular password. If the regular password doesn't work, generate an App Password from [Google Account Settings](https://myaccount.google.com/apppasswords).

### Option 2: SendGrid

1. Create a SendGrid account
2. Create an API key
3. Configure `.env`:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Option 3: Custom SMTP Server

Configure with your SMTP provider's settings:
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
EMAIL_FROM=noreply@yourdomain.com
```

## Database Migration

Run the migration to add the required database tables:

```sql
-- Run this SQL script in your MySQL database
-- File: backend/src/migrations/add_email_verification.sql
```

Or execute the SQL file:
```bash
mysql -u your_user -p your_database < backend/src/migrations/add_email_verification.sql
```

## Testing

After configuration, test the email sending:

1. Start the backend server
2. Register a new user
3. Check the email inbox for the OTP code
4. Verify the email using the OTP code

## Troubleshooting

### Email not sending
- Check that all environment variables are set correctly
- Verify SMTP credentials
- Check server logs for error messages
- Ensure firewall allows outbound SMTP connections (port 587/465)

### OTP not received
- Check spam/junk folder
- Verify email address is correct
- Check email service logs
- Ensure OTP hasn't expired (10 minutes)

### Database errors
- Ensure migration has been run
- Check database connection
- Verify table structure matches migration

