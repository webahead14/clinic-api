import { catchAsync, ApiError } from '../utils';
import {
  fetchProtocols,
  fetchSurveys,
  fetchSurveysQuantityByProtocolId,
  fetchQuestionQuantityBySurveyId,
} from '../models/clinics.models';
import httpStatus from 'http-status';

const getAllProtocols = catchAsync(async (req, res) => {
  const protocolList = await fetchProtocols();
  if (!protocolList.length)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Unable to fetch protocols'
    );
  else {
    for (let protocol of protocolList) {
      protocol.surveysAmount = await fetchSurveysQuantityByProtocolId(
        protocol.id
      );
      protocol.date = protocol.created_at.toLocaleDateString('he-il');
      delete protocol.created_at;
    }
    res.status(httpStatus.OK).send({ protocols: protocolList });
  }
});

const getAllSurveys = catchAsync(async (req, res) => {
  const surveysList = await fetchSurveys();
  if (!surveysList.length)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Unable to fetch surveys'
    );
  else {
    for (let survey of surveysList) {
      survey.questionsAmount = await fetchQuestionQuantityBySurveyId(survey.id);
      survey.date = survey.created_at.toLocaleDateString('he-il');
      delete survey.created_at;
    }
    res.status(httpStatus.OK).send({ surveys: surveysList });
  }
});

export default { getProtocols: getAllProtocols, getSurveys: getAllSurveys };
