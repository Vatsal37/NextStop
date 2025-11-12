import nodemailer from 'nodemailer';

// Create transporter - configure with your email service
// For development, you can use Gmail, SendGrid, or other services
const createTransporter = () => {
	// Check if email credentials are configured
	if (!process.env.EMAIL_HOST && !process.env.EMAIL_USER) {
		console.warn('[EMAIL] Email credentials not configured. Email sending will fail.');
		console.warn('[EMAIL] Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in backend/.env');
		return null;
	}

	// For SMTP (Gmail, custom SMTP, etc.)
	if (process.env.EMAIL_HOST) {
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: parseInt(process.env.EMAIL_PORT || '587'),
			secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	}

	// For Gmail OAuth2 or other services, you can extend this
	return null;
};

export const sendOTPEmail = async (email, otpCode, firstName = 'User') => {
	const transporter = createTransporter();
	if (!transporter) {
		throw new Error('Email service not configured');
	}

	const mailOptions = {
		from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@nextstop.com',
		to: email,
		subject: 'Verify Your NextStop Account',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Verify Your Email</title>
			</head>
			<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background: linear-gradient(135deg, #0a1f2b 0%, #1a3a52 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="color: #fff; margin: 0;">NextStop</h1>
				</div>
				<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
					<h2 style="color: #0a1f2b; margin-top: 0;">Hello ${firstName}!</h2>
					<p>Thank you for signing up with NextStop. To complete your registration, please verify your email address using the OTP code below:</p>
					<div style="background: #fff; border: 2px dashed #0a1f2b; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
						<p style="font-size: 32px; font-weight: bold; color: #0a1f2b; letter-spacing: 8px; margin: 0;">${otpCode}</p>
					</div>
					<p>This code will expire in 10 minutes.</p>
					<p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't create an account with NextStop, please ignore this email.</p>
				</div>
			</body>
			</html>
		`,
		text: `
			Hello ${firstName}!
			
			Thank you for signing up with NextStop. To complete your registration, please verify your email address using the OTP code below:
			
			${otpCode}
			
			This code will expire in 10 minutes.
			
			If you didn't create an account with NextStop, please ignore this email.
		`,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log(`[EMAIL] OTP sent to ${email}:`, info.messageId);
		return info;
	} catch (error) {
		console.error('[EMAIL] Failed to send OTP:', error);
		throw error;
	}
};

export const sendForgotPasswordOTPEmail = async (email, otpCode, firstName = 'User') => {
	const transporter = createTransporter();
	if (!transporter) {
		throw new Error('Email service not configured');
	}

	const mailOptions = {
		from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@nextstop.com',
		to: email,
		subject: 'Reset Your NextStop Password',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Reset Your Password</title>
			</head>
			<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background: linear-gradient(135deg, #0a1f2b 0%, #1a3a52 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="color: #fff; margin: 0;">NextStop</h1>
				</div>
				<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
					<h2 style="color: #0a1f2b; margin-top: 0;">Hello ${firstName}!</h2>
					<p>We received a request to reset your password. Please use the OTP code below to verify your identity:</p>
					<div style="background: #fff; border: 2px dashed #0a1f2b; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
						<p style="font-size: 32px; font-weight: bold; color: #0a1f2b; letter-spacing: 8px; margin: 0;">${otpCode}</p>
					</div>
					<p>This code will expire in 10 minutes.</p>
					<p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
				</div>
			</body>
			</html>
		`,
		text: `
			Hello ${firstName}!
			
			We received a request to reset your password. Please use the OTP code below to verify your identity:
			
			${otpCode}
			
			This code will expire in 10 minutes.
			
			If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
		`,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log(`[EMAIL] Forgot password OTP sent to ${email}:`, info.messageId);
		return info;
	} catch (error) {
		console.error('[EMAIL] Failed to send forgot password OTP:', error);
		throw error;
	}
};

