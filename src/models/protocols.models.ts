import db from "../database/connection";

export const addSurveysToProtocol = (data) => {
  return db
    .query(
      `INSERT INTO protocols_surveys (survey_id,protocol_id,week) VALUES ${data}`
    )
    .then(({ rows }) => rows);
};

export const addProtocol = (data) => {
  return db
    .query(`INSERT INTO protocols(name,condition) VALUES($1,$2) RETURNING id`, [
      data.name,
      "",
    ])
    .then(({ rows }) => rows);
};

export const fetchSurveyIdByName = (name) => {
  return db
    .query(`SELECT id FROM surveys WHERE name=$1`, [name])
    .then(({ rows }) => rows);
};
