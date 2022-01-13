import db from "../database/connection";

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

export function addAnswers(query) {
  return db.query(`INSERT INTO answers (answer,question_id) VALUES ${query}`);
}

//get matrix by matrixID on specific language.
export function fetchMatrix(id: number, lang: string = "en") {
  if (lang === "en")
    return db
      .query("SELECT * FROM matrix WHERE id = $1", [id])
      .then((matrix) => matrix.rows[0]);
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
export function fetchQuestions(surveyID: number, lang: string = "en") {
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

//set new survey and return it id.
export const setSurvey = (name: string) => {
  return db
    .query("INSERT INTO surveys(name) VALUES($1) RETURNING id", [name])
    .then((res) => res.rows[0].id);
};

//get servy
export const fetchSurveyByName = (name: string) => {
  return db
    .query("SELECT * FROM surveys WHERE name = $1", [name])
    .then((response) => response.rows);
};

//take matrix object as an argument and return it id after inserting it to matrix table.
export const setMatrix = ({
  title,
  columns,
  answers,
  instructions,
}: {
  title: string;
  columns: string;
  answers: string;
  instructions: string;
}) => {
  const values = [title, columns, answers, instructions];
  return db
    .query(
      "INSERT INTO matrix(title, columns, answers, instructions) VALUES($1, $2, $3, $4) RETURNING id",
      values
    )
    .then((res) => res.rows[0].id);
};

//take a question object as an argument and return it id after inserting it to questions table.
export const setQuestions = ({
  matrixID,
  type,
  group,
  question,
  extraData,
}: {
  matrixID: number;
  type: string;
  group: string;
  question: string;
  extraData: string;
}) => {
  const values = [matrixID, type, group, question, extraData];
  return db
    .query(
      `INSERT INTO questions(matrix_id, type, "group", question, extra_data) VALUES($1, $2, $3, $4, $5) RETURNING id`,
      values
    )
    .then((res) => res.rows[0].id);
};

//set new survey and return it id.
export const attachQuestionsToSurvey = (
  questionsID: number,
  surveyID: number
) => {
  return db.query(
    "INSERT INTO questions_surveys(question_id, survey_id) VALUES($1, $2) RETURNING id",
    [questionsID, surveyID]
  );
};
