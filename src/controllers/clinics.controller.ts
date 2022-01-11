import { catchAsync, ApiError, deleteProps } from "../utils";
import { fetchProtocols, fetchSurveys } from "../models/clinics.model";
import httpStatus from "http-status";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import passcodeGenerator from "generate-password";
import bcrypt from "bcryptjs";

dotenv.config();

import {
  updateReminder,
  updateClient,
  getClient,
  getTreatment,
  getProtocol,
  fetchSurveysByClientAndTreatment,
  getClientByGovId,
  setTempPasscode,
} from "../models/clients.models";

// Get a specific client's data
const getClientData = catchAsync(async (req: any, res: any) => {
  const id = req.params.id;

  const client = (await getClient(id))[0];

  if (!client) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No client found");
  }

  const treatment = await getTreatment(client.id);

  if (!treatment) {
    const response = {
      client: client,
      status: "success",
    };

    return res.status(httpStatus.OK).send(response);
  }

  const protocol = await getProtocol(treatment.protocol_id);

  const surveys = await fetchSurveysByClientAndTreatment(
    client.id,
    treatment.id
  );

  // normalize data
  client.govId = client.gov_id;
  treatment.startDate = treatment.start_date;

  const normalizedSurveys = surveys.map((survey) => ({
    isDone: survey.is_done,
    isPartiallyDone: survey.is_partially_done,
    hasMissed: survey.has_missed,
    name: survey.name,
    week: survey.week,
  }));

  // delete unwanted data
  deleteProps(treatment, ["protocol_id", "start_date"]);
  deleteProps(client, ["gov_id"]);

  const response = {
    ...client,
    surveyProgress: normalizedSurveys,
    protocol: protocol,
    treatment,
    status: "success",
  };
  res.status(httpStatus.OK).send(response);
});

// Get the list of all protocols
const getAllProtocols = catchAsync(async (req, res) => {
  const protocolList = await fetchProtocols();

  if (!protocolList.length)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to fetch protocols"
    );

  for (let protocol of protocolList) {
    protocol.surveysAmount = protocol.surveys_amount;
    protocol.surveysTypes = protocol.surveys_types;
    protocol.date = protocol.created_at.toLocaleDateString("he-il");

    deleteProps(protocol, [
      "created_at",
      "surveys_amount",
      "surveys_types",
      "protocol_id",
      "clinic_id",
    ]);
  }

  res.status(httpStatus.OK).send({ protocols: protocolList });
});

// Get a list of all surveys
const getAllSurveys = catchAsync(async (req, res) => {
  const surveysList = await fetchSurveys();

  if (!surveysList.length)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to fetch surveys"
    );

  for (let survey of surveysList) {
    survey.questionsAmount = survey.questions_amount;
    survey.date = survey.created_at.toLocaleDateString("he-il");

    deleteProps(survey, [
      "created_at",
      "questions_amount",
      "survey_id",
      "clinic_id",
    ]);
  }

  res.status(httpStatus.OK).send({ surveys: surveysList });
});

//Get temporary password by mail/sms
const sendTempPasscode = catchAsync(async (req, res) => {
  const { govId, email } = req.body;

  const account = await getClientByGovId(govId);
  if (typeof account === "undefined")
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Government id number is not correct."
    );

  if (email !== account.email)
    throw new ApiError(httpStatus.NOT_FOUND, "Email is not matching!");

  account.expiresIn = account.time_passcode_expiry;
  delete account.time_passcode_expiry;

  const balancedTime = 1680000; // 28 minutes in miliseconds
  //expiresIn - 30 min + 2min
  const timeBeforeTwoMinutes = account.expiresIn.getTime() - balancedTime; //since the client got his latest passcode.

  if (new Date() < new Date(timeBeforeTwoMinutes))
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      "You have exceeded your requests per minute."
    );

  const passcode = passcodeGenerator.generate({ length: 10, numbers: true });

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(passcode, salt);

  const currentTime = new Date().getTime();
  const halfHour = 1800000; // in miliseconds
  const expiresIn = new Date(currentTime + halfHour);

  //update temporary passcode at db query.
  try {
    await setTempPasscode(account.id, hash, expiresIn);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `${error}`);
  }

  //sensitive data from .env file.
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

  //what data to send and to whom.
  let mailOptions = {
    from: `${MAIL_USERNAME}@gmail.com`,
    to: `${email}`,
    subject: "Gray Matter temporary passcode",
    // text: "Hi from your graymatter project",
    html: `<h2><em>Temporary Access Key</em></h2><div style="font-size: 22px;">Hi <span style="text-decoration: underline;">${account.name}</span>, <div style="font-size: 20px; margin-top: 10px;">Please use the passcode you've got below in order to sign in.</div></div>
      <ul style="color:red;font-size: 18px;">
      <li>Don't share this passcode with anyone.</li>
      <li>The passcode will grante you access to your account for 30 minutes only. </li>
      </ul>
      <div style="font-weight: bold; font-size: 22px; border: 3px outset  LightBlue; width: fit-content; margin: 25px 30%; padding: 10px;
        box-shadow: 5px 5px 8px CornflowerBlue; border-radius: 8px;">${passcode}</div>`,
  };

  //Send a new email.
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `An error occured: ${err.message}`
      );
    } else {
      res.status(httpStatus.OK).send({ response: "Email sent successfully." });
    }
  });
});

//Updates the clients data
// req.body == {id:client_id, client:{condition,phone,email,name,gender},reminder:JSON}
const updateClientData = catchAsync(async (req: any, res: any) => {
  try {
    await updateClient(
      [
        req.body.condition,
        req.body.phone,
        req.body.email,
        req.body.name,
        req.body.gender,
      ],
      req.body.id
    );
    await updateReminder(req.body.reminder, req.body.id);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `${error}`);
  }
});
export default {
  updateClientData: updateClientData,
  getProtocols: getAllProtocols,
  getSurveys: getAllSurveys,
  getClientData: getClientData,
  sendPasscode: sendTempPasscode,
};
