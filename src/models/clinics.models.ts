import db from '../database/connection';

export function fetchProtocols() {
  return db.query('SELECT * FROM protocols').then((protocols) => {
    return protocols.rows;
  });
}

export function fetchSurveys() {
  return db.query('SELECT * FROM surveys').then((surveys) => {
    console.log(surveys.rows);
    return surveys.rows;
  });
}
