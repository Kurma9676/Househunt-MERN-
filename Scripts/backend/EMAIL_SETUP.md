# Email Setup Guide for HouseHunt

This guide will help you set up email functionality for password reset and welcome emails in the HouseHunt application.

## Prerequisites

- A Gmail account
- 2-factor authentication enabled on your Gmail account

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

## Step 2: Generate App Password

1. Go to Google Account settings: https://myaccount.google.com/
2. Navigate to Security
3. Under "2-Step Verification", click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Click "Generate"
6. Copy the 16-character password that appears

## Step 3: Update Configuration

1. Open `backend/config.env`
2. Replace the placeholder values with your actual Gmail credentials:

```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## Step 4: Test Email Functionality

1. Start the backend server: `npm run dev`
2. Test the forgot password functionality:
   - Go to the login page
   - Click "Forgot Password?"
   - Enter a valid email address
   - Check if the email is received

3. Test registration:
   - Register a new user
   - Check if a welcome email is received

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**
   - Make sure you're using the App Password, not your regular Gmail password
   - Ensure 2-factor authentication is enabled

2. **"Less secure app access" error**
   - This is normal with App Passwords, it's more secure than regular passwords

3. **Emails not being sent**
   - Check the server console for error messages
   - Verify your Gmail credentials are correct
   - Ensure your Gmail account has sending permissions

4. **Emails going to spam**
   - Check your spam folder
   - Add the sender email to your contacts

### Alternative Email Services

If you prefer not to use Gmail, you can modify the email service to use other providers:

- **SendGrid**: Professional email service with free tier
- **Mailgun**: Email API service
- **AWS SES**: Amazon's email service
- **Nodemailer with SMTP**: Use any SMTP server

## Security Notes

- Never commit your actual email credentials to version control
- Use environment variables for sensitive information
- Consider using a dedicated email service for production applications
- Regularly rotate your App Passwords

## Production Considerations

For production deployment:

1. Use a dedicated email service (SendGrid, Mailgun, etc.)
2. Set up proper email templates
3. Implement email verification
4. Add rate limiting for email sending
5. Set up email monitoring and logging
6. Remove development-only features (like showing reset URLs in responses) 