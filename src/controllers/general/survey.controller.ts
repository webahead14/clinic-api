import { fetchSurveyById } from "../../models/survey";
import { catchAsync, ApiError } from "../../utils";
import httpStatus from "http-status";
import { addAnswers } from "../../models/survey";

const getSurveyById = catchAsync(async (req, res) => {
  let id = req.params.id;
  const data = (await fetchSurveyById(id))[0];

  if (data.is_done) throw new ApiError(httpStatus.BAD_REQUEST, "Survey already done");

  if (data.has_missed) throw new ApiError(httpStatus.BAD_REQUEST, "Survey was missed");

  res.status(httpStatus.OK).send(data.survey_snapshot);
});

const insertAnswers = catchAsync(async (req, res) => {
  const answers = req.body;
  let multipeRows = "";
  answers.map((element, index) => {
    multipeRows += `(${element.answers},${element.question_id})`;
    index == answers.length - 1 ? (multipeRows += ";") : (multipeRows += ",");
  });
  await addAnswers(multipeRows);
  res.send({ status: "success" });
});

export default { getSurveyById, insertAnswers };
