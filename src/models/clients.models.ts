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
    console.log(surveys);
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
    .then((treatment) => treatment.rows[0].id);
}

//create client
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
    .then((govId) => {
      return govId.rows[0].id;
    });
}

//fetch client

export function getClient(data) {
  return db
    .query("SELECT * FROM clients WHERE gov_id = $1", [data])
    .then((client) => {
      return client.rows;
    });
}
