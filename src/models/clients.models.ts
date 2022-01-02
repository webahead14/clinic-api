import db from "../database/connection";

export function fetchClients() {
  return db.query("SELECT * FROM clients").then((clients) => {
    return clients.rows;
  });
}

export function getClient(data) {
  const gov_id = [data.gov_id];
  return db
    .query("SELECT * FROM clients WHERE gov_id = $1", gov_id)
    .then((client) => {
      return client.rows;
    });
}

export function attachSurveysToClient(protocolId, clientId) {}

export async function createTreatment(data) {
  const govId = await addClient(data.client);
  const treatment = [govId, client.protocolId, client.startDate];
  return db.query(
    `INSERT INTO treatment (client_id,protocol_id,start_date) 
    VALUES ($1,$2,$3)`,
    treatment
  );
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
//fetch client
