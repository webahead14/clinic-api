import { catchAsync, ApiError, deleteProps, sendMail } from "../utils";
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
    protocol.id = protocol.id;

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
      `You have exceeded your requests per minute. try after: ${new Date(
        timeBeforeTwoMinutes
      ).toLocaleTimeString()}`
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

  //the mail content and address.
  let mailOptions = {
    from: `${process.env.MAIL_USERNAME}@gmail.com`,
    to: `${email}`,
    subject: "GrayMatters Healthtemporary passcode",
    html: `<div style="font-size: 22px;">Hi, ${account.name}</span>, <div style="font-size: 20px; margin-top: 10px;">We received a request for a temporary passcode. Please use the passcode below in order to sign in.</div></div>
    <ul style="color: red; font-size: 18px;">
    <li>Do not share this passcode with anyone.</li>
    <li>The passcode will grant you access to your account for 30 minutes.  </li>
    <li>In the event that your passcode expires, try requesting another one through our login page.</li>
    </ul>
    <h2 style="margin: 25px 30%; font-size:22px;">Temporary Access Key</h2>
    <div style="font-weight: bold; font-size: 22px; border: 3px outset  LightBlue; width: fit-content; margin: 25px 35%; padding: 10px;
      box-shadow: 5px 5px 8px CornflowerBlue; border-radius: 8px;">${passcode}</div>`,
  };

  sendMail(mailOptions);
  res.status(httpStatus.OK).send({ response: "Email sent successfully." });
});

//Updates the clients data
// req.body == {id:client_id, client:{condition,phone,email,name,gender},reminder:JSON}
const updateClientData = catchAsync(async (req: any, res: any) => {
  const { reminder, id, condition, phone, email, name, gender } = req.body;

  await updateClient([condition, phone, email, name, gender], id);

  await updateReminder(reminder, id);

  res
    .status(200)
    .send({ success: true, message: "succeded in updating the client data" });
});
export default {
  updateClientData: updateClientData,
  getProtocols: getAllProtocols,
  getSurveys: getAllSurveys,
  getClientData: getClientData,
  sendPasscode: sendTempPasscode,
};
