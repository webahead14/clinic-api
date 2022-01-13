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
  try {
    const protocolId = await addProtocol(name);

    let multipleRows = ""; //example: '(1,21,1),(2,21,1),(3,21,1),(1,21,2),(1,21,3),(2,21,3),(1,21,4);'
    //iterate over every week, on every single one iterate over every survey then tie each survey to the protocolID and to the week it's scheduled on.
    for (const [protocolDataIndex, week] of protocolData.entries()) {
      for (const [surveysIndex, survey] of week.surveys.entries()) {
        const surveyId = await fetchSurveyIdByName(survey);
        multipleRows += `(${surveyId},${protocolId},${week.week})`;
        //as long as it's not that last survey and not the last week => insert ','
        surveysIndex == week.surveys.length - 1 &&
        protocolDataIndex == protocolData.length - 1
          ? (multipleRows += ";")
          : (multipleRows += ",");
      }
    }
    await addSurveysToProtocol(multipleRows);
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to add protocol."
    );
  }

  res.send({ status: "success" });
});

export default {
  createProtocol: createProtocol,
};
