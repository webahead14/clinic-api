import { fetchSurveyById } from "../../models/survey";
import { catchAsync, ApiError } from "../../utils";
import httpStatus from "http-status";

const getSurveyById = catchAsync(async (req, res) => {
  let id = req.params.id;
  const data = (await fetchSurveyById(id))[0];
  if (data.is_done)
    throw new ApiError(httpStatus.BAD_REQUEST, "Survey already done");

  if (data.has_missed)
    throw new ApiError(httpStatus.BAD_REQUEST, "Survey was missed");

  res.status(httpStatus.OK).send(data.survey_snapshot);
});

export default { getSurveyById };
