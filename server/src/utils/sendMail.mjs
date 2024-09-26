import nodeMailer from "nodemailer";
import { google } from "googleapis";

const { OAuth2 } = google.auth;

const { GOOGLE_CLIENT_ID, GOOGLE_SECRET, GOOGLE_REFRESH_TOKEN, SENDERS_EMAIL } =
	process.env;

const oAuth2Client = new OAuth2(
	GOOGLE_CLIENT_ID,
	GOOGLE_SECRET,
	GOOGLE_REFRESH_TOKEN,
	SENDERS_EMAIL
);

export const sendMail = (to, token, sub) => {
	oAuth2Client.setCredentials({
		refresh_token: GOOGLE_REFRESH_TOKEN,
	});
	const accessToken = oAuth2Client.getAccessToken();
	const smtpTransort = nodeMailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: SENDERS_EMAIL,
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_SECRET,
			refreshToken: GOOGLE_REFRESH_TOKEN,
			accessToken,
		},
	});

	const mailOptions = {
		from: SENDERS_EMAIL,
		to: to,
		subject: `Gruspay - ${sub}`,
		generateTextFromHTML: true,
		html: `
    <div style=" width: 700px; margin-left: auto; margin-right: auto;">
      <div style="margin: 0; font-size: 1.5rem; color: #333;">
        <p>Hi, there</p>
      </div>

      <div>
        <p style="font-size: 16px; color: #555; margin: 10px 0;">This is your verification code:</p>
        <div style="font-size: 24px; font-weight: bold; color: #050201; margin: 20px 0;">
          <span style="border: 2px solid #ff5722; padding: 6px 12px; margin: 0 2px; display: inline-block; border-radius: 5px;">${token.charAt(
						0
					)}</span>
          <span  style="border: 2px solid #ff5722; padding: 6px 12px; margin: 0 2px; display: inline-block; border-radius: 5px;">${token.charAt(
						1
					)}</span>
          <span  style="border: 2px solid #ff5722; padding: 6px 12px; margin: 0 2px; display: inline-block; border-radius: 5px;">${token.charAt(
						2
					)}</span>
          <span  style="border: 2px solid #ff5722; padding: 6px 12px; margin: 0 2px; display: inline-block; border-radius: 5px;">-</span>
          <span  style="border: 2px solid #ff5722; padding: 6px 12px; margin: 0 2px; display: inline-block; border-radius: 5px;">${token.charAt(
						3
					)}</span>
          <span  style="border: 2px solid #ff5722; padding: 6px 12px; margin: 0 2px; display: inline-block; border-radius: 5px;">${token.charAt(
						4
					)}</span>
          <span  style="border: 2px solid #ff5722; padding: 6px 12px; margin: 0 2px; display: inline-block; border-radius: 5px;">${token.charAt(
						5
					)}</span>
        </div>
        <p style="line-height: 1.4rem font-size: 16px; color: #555; margin: 10px 0;">
          This code will only be valid for the next 5 minutes.
        </p>
      </div>

      <p style="line-height: 1.4rem">Thanks,<br />Gruspsy Team</p>
    </div>
    `,
	};

	smtpTransort.sendMail(mailOptions, (err, info) => {
		if (err) return err;
		return info;
	});
};
