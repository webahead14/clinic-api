var CronJob = require("cron").CronJob;
import db from "../database/connection";
import moment from "moment";
import sendMail from "./emailer";
import dotenv from "dotenv";

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
  "* * * * * *",
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
            moment().isSameOrAfter(moment(client.reminders.time))
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
            const { MAIL_USERNAME } = process.env;

            db.query(`SELECT * FROM clients WHERE id = $1`, client).then(
              ({ rows }) => {
                let mailOptions = {
                  from: `${MAIL_USERNAME}@gmail.com`,
                  to: `${rows.email}`,
                  subject: "GrayMatters Health Survey Reminder",
                  html: `
                  <h2><em>Reminder!</em></h2>
                  <div style="font-size: 22px;">Hi <span style="text-decoration: underline;">${rows.name}</span>, 
                    <div style="font-size: 20px; margin-top: 10px;">Please don't forget to do your survey.</div>
                  </div>
                 
                `,
                };
                sendMail(mailOptions);
              }
            );
          }
        }
      });
    });
  },
  { scheduled: false, timezone: "Israel" }
);

export default { updateMissedJob, remindersJob };
