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
  let query = "";
  answers.map((element, index) => {
    query += `(${element.answers},${element.question_id})`;
    index == answers.length - 1 ? (query += ";") : (query += ",");
  });
  addAnswers(query);
  res.send();
});

export default { getSurveyById, insertAnswers };

/*
get from the frontend an array of json which every json contains an answer and its question_id
exp:
[{answer:json.question_id:1}]
*/
