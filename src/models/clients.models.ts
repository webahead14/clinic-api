import db from "../database/connection";
import fetchSurveyData from "../services/survey.service";

export function fetchClients() {
  return db.query("SELECT * FROM clients").then((clients) => {
    return clients.rows;
  });
}

export function fetchSurveysByProtocolId(protocolId) {
  return db
    .query(
      "SELECT * FROM protocols_surveys ps INNER JOIN surveys ON surveys.id = ps.survey_id WHERE ps.protocol_id = $1",
      [protocolId]
    )
    .then((surveys) => surveys.rows);
}

export function attachSurveysToClient(protocolId, clientId, treatmentId) {
  return fetchSurveysByProtocolId(protocolId).then((surveys) => {
    surveys.forEach(async (survey) => {
      let formattedSurvey = await fetchSurveyData(survey.survey_id);
      return db.query(
        `INSERT INTO clients_surveys (client_id,survey_id,treatment_id,survey_snapshot)
                VALUES ($1,$2,$3,$4)`,
        [clientId, survey.id, treatmentId, JSON.stringify(formattedSurvey)]
      );
    });
  });
}

export function createTreatment(clientId, protocolId, startDate) {
  const treatment = [clientId, protocolId, startDate];
  return db
    .query(
      `INSERT INTO treatment (client_id,protocol_id,start_date) 
    VALUES ($1,$2,$3) RETURNING id`,
      treatment
    )
    .then(({ rows }) => rows[0].id);
}

// create client
export function addClient(client) {
  const user = [
    client.passcode,
    client.govId,
    client.condition,
    client.phone,
    client.email,
    client.name,
    client.gender,
  ];

  return db
    .query(
      `INSERT INTO clients 
      (passcode,gov_id,condition,phone,email,name,gender) 
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id`,
      user
    )
    .then(({ rows }) => {
      return rows[0].id;
    });
}

// fetch client
export function getClient(data) {
  return db
    .query(
      "SELECT id, gov_id, name, gender, email, phone, condition FROM clients WHERE id = $1",
      [data]
    )
    .then((client) => {
      return client.rows;
    });
}

// fetch client by govID
export function getClientByGovId(id) {
  return db
    .query(
      "SELECT id, name, email, phone, time_passcode_expiry FROM clients WHERE gov_id = $1",
      [id]
    )
    .then((client) => client.rows[0]);
}

// update client temporary passcode by client id
export function setTempPasscode(id, hash, expiresIn) {
  return db.query(
    `UPDATE clients SET time_passcode=$2, time_passcode_expiry=$3 WHERE id = $1`,
    [id, hash, expiresIn]
  );
}

export function fetchSurveysByClientAndTreatment(clientId, treatmentId) {
  // To add to this query
  // once the survey_date is added to the clients_surveys table then we will need to add it to this query
  // so when can show the date of each survey for the client -> clients_surveys.survey_date
  return db
    .query(
      `SELECT clients_surveys.is_done, clients_surveys.is_partially_done, clients_surveys.has_missed, surveys.name
      FROM clients_surveys 
      LEFT JOIN surveys ON surveys.id = clients_surveys.survey_id
      WHERE clients_surveys.client_id = $1 AND clients_surveys.treatment_id = $2`,
      [clientId, treatmentId]
    )
    .then((surveys) => {
      return surveys.rows;
    });
}

export function getTreatment(id) {
  return db
    .query(
      "SELECT id, protocol_id, start_date, status FROM treatment WHERE client_id = $1",
      [id]
    )
    .then((treatment) => {
      return treatment.rows[0];
    });
}

export function getProtocol(id) {
  return db
    .query("SELECT name FROM protocols WHERE id = $1", [id])
    .then((protocol) => {
      return protocol.rows[0];
    });
}

//get matrix by matrixID on specific language.
export function fetchMatrix(id, lang = "en") {
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
