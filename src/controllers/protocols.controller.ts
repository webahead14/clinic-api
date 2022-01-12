import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import {
  addProtocol,
  addSurveysToProtocol,
  fetchSurveyIdByName,
} from "../models/protocols.models";

const createProtocol = catchAsync(async (req, res) => {
  const { name, protocolData } = req.body;
  const protocolId = (await addProtocol(name))[0].id;
  if (protocolId) {
    let query = "";
    for (const [protocolDataIndex, week] of protocolData.entries()) {
      for (const [surveysIndex, survey] of week.surveys.entries()) {
        const surveyId = (await fetchSurveyIdByName(survey))[0];
        if (surveyId) {
          query += `(${surveyId.id},${protocolId},${week.week})`;
          surveysIndex == week.surveys.length - 1 &&
          protocolDataIndex == protocolData.length - 1
            ? (query += ";")
            : (query += ",");
        }
      }
    }
    addSurveysToProtocol(query);
    res.send({ status: "success" });
  } else {
    res.send({ status: "error" });
  }
});
export default {
  createProtocol: createProtocol,
};
