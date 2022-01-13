import db from "../database/connection";
import fetchSurveyData from "../services/survey.service";
import moment from "moment";

export function fetchClients() {
  return db
    .query(
      `SELECT clients.id, clients.name, clients.phone, clients.condition, 
  treatment.start_date, treatment.status, protocols.name AS protoc FROM clients LEFT JOIN treatment ON clients.id = treatment.client_id
  INNER JOIN protocols ON protocols.id = treatment.protocol_id`
    )
    .then((clients) => {
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

export function attachSurveysToClient(
  protocolId,
  clientId,
  treatmentId,
  startDate
) {
  return fetchSurveysByProtocolId(protocolId).then((surveys) => {
    surveys.forEach(async (survey) => {
      let formattedSurvey = await fetchSurveyData(survey.survey_id);
      let surveyDate = moment(startDate).add({ weeks: +survey.week });
      return db.query(
        `INSERT INTO clients_surveys (client_id,survey_id,treatment_id,survey_snapshot,survey_date)
                VALUES ($1,$2,$3,$4,$5)`,
        [
          clientId,
          survey.id,
          treatmentId,
          JSON.stringify(formattedSurvey),
          surveyDate,
        ]
      );
    });
  });
}

export function createTreatment(clientId, protocolId, startDate, reminders) {
  const treatment = [
    clientId,
    protocolId,
    startDate,
    JSON.stringify(reminders),
  ];
  return db
    .query(
      `INSERT INTO treatment (client_id,protocol_id,start_date,reminders) 
    VALUES ($1,$2,$3,$4) RETURNING id`,
      treatment
    )
    .then(({ rows }) => rows[0].id);
}

// create client
export function addClient(client) {
  const user = [
    client.passcode,
    client.temPasscode,
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
      (passcode,time_passcode,gov_id,condition,phone,email,name,gender) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
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
    .query("SELECT * FROM clients WHERE gov_id = $1", [id])
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
      `SELECT clients_surveys.is_done, clients_surveys.is_partially_done, clients_surveys.has_missed, surveys.name, protocols_surveys.week
      FROM clients_surveys 
      LEFT JOIN surveys ON surveys.id = clients_surveys.survey_id
      LEFT JOIN protocols_surveys ON protocols_surveys.id = clients_surveys.survey_id
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

export function updateClient(client, clientId) {
  return db.query(
    `UPDATE clients SET condition = $1 phone = $2 email = $3 name = $4 gender = $5 WHERE id = $6`,
    [...client, clientId]
  );
}

export function updateReminder(reminder, clientId) {
  return db.query(`UPDATE clients SET reminder = $1 WHERE client_id = $2`, [
    reminder,
    clientId,
  ]);
}
