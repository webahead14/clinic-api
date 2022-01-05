import {
  getClient,
  getTreatment,
  getProtocol,
  fetchSurveysByClientAndTreatment,
} from "../../models/clients.models";
import { fetchProtocols, fetchSurveys } from "../../models/clinics.model";
import deleteProps from "../../utils/deleteProps";

import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";

const getData = catchAsync(async (req: any, res: any) => {
  const gov_id = req.params.id;

  const client = (await getClient(gov_id))[0]; //gets all client info

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
  const response = {
    client: client,
    surveys: surveys,
    protocol: protocol,
    status: "success",
  };
  res.status(httpStatus.OK).send(response);
});

//protocolList
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

//surveyList
const getAllSurveys = catchAsync(async (req, res) => {
  const surveysList = await fetchSurveys();
  if (!surveysList.length)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to fetch surveys"
    );
  for (let survey of surveysList) {
    // survey.questionsAmount = await fetchQuestionQuantityBySurveyId(survey.id);
    survey.questionsAmount = survey.questions_amount;
    survey.date = survey.created_at.toLocaleDateString("he-il");
    delete survey.created_at;
    deleteProps(survey, [
      "created_at",
      "questions_amount",
      "survey_id",
      "clinic_id",
    ]);
  }
  res.status(httpStatus.OK).send({ surveys: surveysList });
});

export default {
  getProtocols: getAllProtocols,
  getSurveys: getAllSurveys,
  getData: getData,
};
