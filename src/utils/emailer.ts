import nodemailer from "nodemailer";
import ApiError from "./ApiError";
import httpStatus from "http-status";
import dotenv from "dotenv";

export default function sendMail(mailOptions) {
  dotenv.config();
  const {
    MAIL_USERNAME,
    MAIL_PASSWORD,
    OAUTH_CLIENTID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REFRESH_TOKEN,
  } = process.env;

  //transport configuration object,
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: MAIL_USERNAME,
      pass: MAIL_PASSWORD,
      clientId: OAUTH_CLIENTID,
      clientSecret: OAUTH_CLIENT_SECRET,
      refreshToken: OAUTH_REFRESH_TOKEN,
    },
  });

  //Send a new email.
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `An error occured: ${err.message}`
      );
    } else {
      console.log("Email sent");
    }
  });
}
