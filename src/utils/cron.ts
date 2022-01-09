import db from "../database/connection";
// import moment from "moment";
import moment from "moment-timezone";
import sendMail from "./emailer";
import dotenv from "dotenv";
import cron from "node-cron";

const updateMissedJob = () =>
  cron.schedule("0 59 23 * * *", async function () {
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
  });

const remindersJob = () =>
  cron.schedule("*/5 * * * * *", async function () {
    const clients = await db
      .query(`SELECT * FROM treatment WHERE status='on-going'`)
      .then(({ rows }) => rows);

    clients.forEach(async (client) => {
      const clientSurveys = await db
        .query(
          `SELECT * from clients_surveys WHERE client_id = $1 AND is_done = 'false' AND has_missed = 'false'`,
          [client.client_id]
        )
        .then(({ rows }) => rows);
      if (clientSurveys.length == 0) return;
      const currDate = moment(moment().toDate()).format("L");
      const surveyDate = moment(clientSurveys[0].survey_date).format("L");
      var sent = false;
      let count = 0;
      if (currDate === surveyDate) {
        client.reminders.forEach((reminder) => {
          if (!sent) {
            count++;
            var time = moment().tz("Asia/Jerusalem");
            time.set({
              hour: +reminder.time.split(":")[0],
              minute: +reminder.time.split(":")[1],
              second: 0,
              millisecond: 0,
            });
            if (
              !reminder.has_sent &&
              moment().tz("Asia/Jerusalem").isSameOrAfter(time)
            ) {
              //update hasSent to true
              let reminders = client.reminders.filter(
                (tempReminder) => tempReminder.time !== reminder.time
              );
              reminders = [
                ...reminders,
                { time: reminder.time, has_sent: true },
              ];
              db.query(
                "UPDATE treatment SET reminders = $1 WHERE client_id = $2",
                [JSON.stringify(reminders), client.client_id]
              );
              //send email
              const { MAIL_USERNAME } = process.env;

              const clientData = db
                .query(`SELECT * FROM clients WHERE id = $1`, [
                  client.client_id,
                ])
                .then(({ rows }) => rows[0]);

              let mailOptions = {
                from: `${MAIL_USERNAME}@gmail.com`,
                to: `${clientData.email}`,
                subject: "GrayMatters Health Survey Reminder",
                html: `
                    <h2><em>Reminder!</em></h2>
                    <div style="font-size: 22px;">Hi <span style="text-decoration: underline;">${clientData.name}</span>, 
                    <div style="font-size: 20px; margin-top: 10px;">Please don't forget to do your survey.</div>
                    </div>
                    
                    `,
              };
              // sendMail(mailOptions);
              console.log("EMAI XENT YEET KHJDBFKJHDIKFYH");
              sent = true;
            }
          }
        });
      }
    });
  });

export default { updateMissedJob, remindersJob };
