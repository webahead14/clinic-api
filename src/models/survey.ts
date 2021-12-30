import db from "../database/connection";

export const fetchQuestionsBySurveyId = (surveyId: number) => {
  return db
    .query(
      "SELECT * FROM questions_surveys qs INNER JOIN questions ON questions.id = qs.question_id WHERE qs.survey_id = $1",
      [surveyId]
    )
    .then((response) => {
      return response.rows;
    });
};

export const fetchMatrixById = (matrixId: number) => {
  return db
    .query("SELECT * FROM matrix WHERE id = $1", [matrixId])
    .then((response) => {
      return response.rows;
    });
};
