import db from "../database/connection";

export function fetchProtocols() {
  return db.query("SELECT * FROM protocols").then((protocols) => {
    return protocols.rows;
  });
}
