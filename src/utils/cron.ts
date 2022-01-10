import db from "../database/connection";
// import moment from "moment";
import moment from "moment-timezone";
import sendMail from "./emailer";
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
  cron.schedule("* */5 * * * *", async function () {
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

      if (currDate === surveyDate) {
        client.reminders.forEach(async (reminder) => {
          if (!sent) {
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
              const clientData = await db
                .query(`SELECT * FROM clients WHERE id = $1`, [
                  client.client_id,
                ])
                .then(({ rows }) => rows[0]);
              //formatting all client surveys to <li></li> elements
              let surveyList = await Promise.all(
                clientSurveys.map(async (survey) => {
                  const surveyData = await db
                    .query(`SELECT * FROM surveys WHERE id=$1`, [
                      survey.survey_id,
                    ])
                    .then(({ rows }) => rows[0]);
                  return `<li>${surveyData.name}</li>`;
                })
              );
              //calculating time left
              let midnight = moment().set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 0,
              });
              let now = moment();
              var x = midnight.diff(now);
              var tempTime = moment.duration(x);
              var remainingTime = tempTime.hours() + ":" + tempTime.minutes();
              let mailOptions = {
                from: `${MAIL_USERNAME}@gmail.com`,
                to: `${clientData.email}`,
                subject: "GrayMatters Health Survey Reminder",
                html: `
                <h2>Reminder</h2>
                <div style="font-size: 22px">
                  Hi <span>${clientData.name}</span>,
                  <div style="font-size: 20px; margin-top: 10px">
                    Please do not forget to do your survey/s.
                  </div>
                  <div>
                    <ul>
                    ${(function showList() {
                      let output = "";
                      for (let i = 0; i < surveyList.length; i++) {
                        output += surveyList[i];
                      }
                      return output;
                    })()}
                    </ul>
                  </div>
                  <span style="font-size: 20px; margin-top: 10px">Time remaining: ${remainingTime} hours</span>
                </div>
                    `,
              };
              sendMail(mailOptions);
              sent = true;
            }
          }
        });
      }
    });
  });

export default { updateMissedJob, remindersJob };
