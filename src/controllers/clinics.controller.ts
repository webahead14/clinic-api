import { catchAsync, ApiError, deleteProps } from "../utils";
import { fetchProtocols, fetchSurveys } from "../models/clinics.models";
import httpStatus from "http-status";

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

export default { getProtocols: getAllProtocols, getSurveys: getAllSurveys };
