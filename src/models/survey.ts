import db from "../database/connection";
import { catchAsync } from "../utils";

export const fetchQuestionsBySurveyId = (surveyId: number) => {
  return db
    .query(
      "SELECT * FROM questions_surveys qs INNER JOIN questions ON questions.id = qs.question_id WHERE qs.survey_id = $1",
      [surveyId]
    )
    .then((response) => response.rows);
};

export const fetchMatrixById = (matrixId: number) => {
  return db
    .query("SELECT * FROM matrix WHERE id = $1", [matrixId])
    .then((response) => response.rows);
};

export const fetchSurveyById = (id: number) => {
  return db
    .query("SELECT * FROM clients_surveys WHERE id = $1", [id])
    .then((response) => response.rows);
};
