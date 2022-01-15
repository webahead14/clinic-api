import db from "../database/connection";

//attach surveys to specific protocol.
export const addSurveysToProtocol = (data) => {
  return db.query(
    `INSERT INTO protocols_surveys (survey_id,protocol_id,week) VALUES ${data}`
  );
};

//add protocol by name, condition is not beeing updated for now.
export const addProtocol = (name) => {
  return db
    .query(`INSERT INTO protocols(name,condition) VALUES($1,$2) RETURNING id`, [
      name,
      "",
    ])
    .then(({ rows }) => rows[0].id);
};
