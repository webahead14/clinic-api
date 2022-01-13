import db from "../database/connection";

export const fetchQuestionsBySurveyId = (surveyId: number) => {
  return db
    .query("SELECT * FROM questions_surveys qs INNER JOIN questions ON questions.id = qs.question_id WHERE qs.survey_id = $1", [surveyId])
    .then((response) => response.rows);
};

export const fetchMatrixById = (matrixId: number) => {
  return db.query("SELECT * FROM matrix WHERE id = $1", [matrixId]).then((response) => response.rows);
};

export const fetchSurveyById = (id: number) => {
  return db.query("SELECT * FROM clients_surveys WHERE id = $1", [id]).then((response) => response.rows);
};

//get matrix by matrixID on specific language.
export function fetchMatrix(id, lang = "en") {
  if (lang === "en") return db.query("SELECT * FROM matrix WHERE id = $1", [id]).then((matrix) => matrix.rows[0]);
  else {
    return db
      .query(
        `SELECT * FROM matrix LEFT JOIN matrix_languages 
            ON matrix.id = matrix_languages.matrix_id WHERE matrix.id = $1 AND matrix_languages.language = $2`,
        [id, lang]
      )
      .then((matrix) => matrix.rows[0]);
  }
}

//get questions by surveyID on specific language
export function fetchQuestions(surveyID, lang = "en") {
  if (lang === "en")
    return db
      .query(
        `SELECT * FROM questions_surveys LEFT JOIN questions ON questions_surveys.question_id = 
      questions.id WHERE survey_id = $1`,
        [surveyID]
      )
      .then((questions) => questions.rows);
  else {
    return db
      .query(
        `SELECT * FROM questions_surveys LEFT JOIN questions_language ON questions_surveys.question_id = 
        questions_language.question_id WHERE survey_id = $1 AND questions_language.language = $2`,
        [surveyID, lang]
      )
      .then((questions) => questions.rows);
  }
}

export function addAnswers(query) {
  return db.query(`INSERT INTO answers (answer,question_id) VALUES ${query}`);
}
