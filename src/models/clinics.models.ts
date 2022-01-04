import db from "../database/connection";

//protocols table join with protocols_surveys table, counting surveys types and surveys amount per protocol.
export function fetchProtocols() {
  return db
    .query(
      `SELECT * FROM protocols LEFT JOIN (SELECT protocol_id, COUNT(DISTINCT survey_id)
       as surveys_types, COUNT(survey_id)
       as surveys_amount FROM protocols_surveys GROUP BY protocol_id)
       as countingTbl ON protocols.id = countingTbl.protocol_id`
    )
    .then((protocols) => protocols.rows);
}

//surveys tbl join with questions_surveys tbl, counting questions per survey.
export function fetchSurveys() {
  return db
    .query(
      `SELECT * FROM surveys LEFT JOIN (SELECT survey_id, COUNT(question_id) 
       as questions_amount FROM questions_surveys GROUP BY survey_id) 
       as countingTbl ON surveys.id = countingTbl.survey_id`
    )
    .then((surveys) => surveys.rows);
}
