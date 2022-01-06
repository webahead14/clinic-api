import { catchAsync, ApiError, deleteProps } from "../utils";
import { fetchProtocols, fetchSurveys } from "../models/clinics.model";
import httpStatus from "http-status";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

import {
  getClient,
  getTreatment,
  getProtocol,
  fetchSurveysByClientAndTreatment,
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

const sendTempPassByMail = catchAsync(async (req, res) => {
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
    to: "mohammadfaour93@gmail.com",
    subject: "GrayMatter Project",
    // text: "Hi from your graymatter project",
    html: `<h1>Mail Test</h1><p style="font-size: 26px;">Hi <span style="text-decoration: underline;">Mario</span>, <span style="color:red;font-size: 22px;">how can a localhost send a mesage to you?</span></p><p style="color:green; font-weight: bold; font-size: 22px;">interesting!</p>`,
  };

  //Send a new email.
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.error("Error " + err);
      res
        .status(httpStatus.OK)
        .send({ response: `An error occured: ${err.message}` });
    } else {
      res.status(httpStatus.OK).send({ response: "Email sent successfully" });
    }
  });
});

export default {
  getProtocols: getAllProtocols,
  getSurveys: getAllSurveys,
  getClientData: getClientData,
  sendPassword: sendTempPassByMail,
};
