import db from "../database/connection";

export function fetchClients() {
  return db.query("SELECT * FROM clients").then((clients) => {
    return clients.rows;
  });
}

export function getClient(data) {
  return db
    .query("SELECT * FROM clients WHERE gov_id = $1", [data])
    .then((client) => {
      return client.rows[0];
    });
}

export function attachSurveysToClient(protocolId, clientId) {}

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
