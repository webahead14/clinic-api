import db from "../database/connection";

export function getClientData(data) {
  return db
    .query(
      `SELECT clients.gov_id, clients.condition,clions.phone,clients.email,clients.name,clients.gender,
       clients_surveys.survery_id FROM clients WHERE gov_id = $1`,
      [data]
    )
    .then((client) => {
      return client.rows[0];
    });
}

//   SELECT Persons.Name, Persons.SS, Fears.Fear FROM Persons
// LEFT JOIN Person_Fear
//     INNER JOIN Fears
//     ON Person_Fear.FearID = Fears.FearID
// ON Person_Fear.PersonID = Persons.PersonID
