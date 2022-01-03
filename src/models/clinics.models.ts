import db from '../database/connection';

export function fetchProtocols() {
  return db.query('SELECT * FROM protocols').then((protocols) => {
    return protocols.rows;
  });
}

export function fetchSurveys() {
  return db.query('SELECT * FROM surveys').then((surveys) => {
    return surveys.rows;
  });
}

//get the array's length of the suerverys attached to specific protocol_id
export function fetchSurveysQuantityByProtocolId(id) {
  return db
    .query(`SELECT * FROM protocols_surveys WHERE protocols_id=${id}`)
    .then((surveys) => {
      return surveys.rows.length;
    });
}

//get the array's length of the questions attached to specific survey.
export function fetchQuestionQuantityBySurveyId(id) {
  return db
    .query(`SELECT * FROM questions_surveys WHERE survey_id=${id}`)
    .then((surveys) => {
      return surveys.rows.length;
    });
}
