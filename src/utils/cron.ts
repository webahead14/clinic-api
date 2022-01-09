var CronJob = require("cron").CronJob;
import db from "../database/connection";
import moment from "moment";

let updateMissedJob = new CronJob(
  "0 59 23 ? * * *",
  async function () {
    const clients = await db
      .query(`SELECT client_id FROM treatment WHERE status='on-going'`)
      .then(({ rows }) => rows);

    clients.forEach(async (client) => {
      const clientSurveys = await db
        .query(
          `SELECT * from clients_surveys WHERE client_id = $1 AND is_done = 'false' AND has_missed = 'false'`,
          [client.client_id]
        )
        .then(({ rows }) => rows);

      clientSurveys.forEach((survey) => {
        const currDate = moment(moment().toDate()).format("L");
        const surveyDate = moment(survey.survey_date).format("L");
        if (currDate === surveyDate) {
          db.query(
            `UPDATE clients_surveys SET has_missed = 'true' WHERE client_id = $1`,
            [client.client_id]
          );
        }
      });
      //resetting reminders
      let reminders = {
        ...client.reminders,
        has_sent: false,
      };
      db.query(`UPDATE treatment SET reminders = $1 ON client_id = $2`, [
        reminders,
        client,
      ]);
    });
  },
  null,
  true,
  "Israel"
);

let remindersJob = new CronJob(
  "0 */5 * ? * *",
  async function () {
    const clients = await db
      .query(`SELECT client_id FROM treatment WHERE status='on-going'`)
      .then(({ rows }) => rows);

    clients.forEach(async (client) => {
      const clientSurveys = await db
        .query(
          `SELECT * from clients_surveys WHERE client_id = $1 AND is_done = 'false' AND has_missed = 'false'`,
          [client.client_id]
        )
        .then(({ rows }) => rows);

      clientSurveys.forEach((survey) => {
        const currDate = moment(moment().toDate()).format("L");
        const surveyDate = moment(survey.survey_date).format("L");
        if (currDate === surveyDate) {
          if (
            !client.reminders.hasSent &&
            client.reminders.time === moment().format("HH:mm")
          ) {
            //update hasSent to true
            let reminders = {
              ...client.reminders,
              has_sent: true,
            };
            db.query(`UPDATE treatment SET reminders = $1 ON client_id = $2`, [
              reminders,
              client,
            ]);
            //send email
          }
        }
      });
    });
  },
  null,
  true,
  "Israel"
);

export default { updateMissedJob, remindersJob };
