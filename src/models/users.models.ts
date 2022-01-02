import db from "../database/connection";

export function fetchClients() {
  return db.query("SELECT * FROM clients").then((clients) => {
    return clients.rows;
  });
}
export function newClient(data) {
  const values = [
    data.condition,
    data.phone,
    data.email,
    data.name,
    data.gender,
    data.startDate,
    data.protocol,
  ];
  return db.query(
    "INSERT INTO clients (condition, phone, email, name,gender) VALUES($1,$2,$3,$4,$5)",
    values
  );
}

//create client
//fetch client
