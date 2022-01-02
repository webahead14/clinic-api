import db from "../database/connection";

export function fetchClients() {
  return db.query("SELECT * FROM clients").then((clients) => {
    return clients.rows;
  });
}

export function fetchSurveysByProtocolId(protocolId) {
  return db
    .query(
      "SELECT * FROM protocols_surveys ps INNER JOIN surveys ON survey.id = ps.survey_id WHERE ps.protocol_id = $1",
      protocolId
    )
    .then((surveys) => surveys.rows);
}

export function attachSurveysToClient(protocolId, clientId) {
  return fetchSurveysByProtocolId(protocolId).then((surveys) => {});
}

//create client
export function addClient(client) {
  const user = [
    client.passcode,
    client.timePasscode,
    client.timePasscodeExpiry,
    client.govId,
    client.condition,
    client.delete,
    client.phone,
    client.email,
    client.name,
    client.gender,
  ];

  return db
    .query(
      `INSERT INTO clients 
            (passcode,time_passcode,time_passcode_expiry,gov_id,condition,deleted,phone,email,name,gender) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING id`,
      user
    )
    .then((govId) => {
      return govId.rows[0].id;
    });
}

export function createTreatment(govId, protocolId, startDate) {
  const treatment = [govId, protocolId, startDate];
  return db.query(
    `INSERT INTO treatment (client_id,protocol_id,start_date) 
    VALUES ($1,$2,$3)`,
    treatment
  );
}
//fetch client
