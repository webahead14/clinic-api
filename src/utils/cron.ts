import db from "../database/connection";
import moment from "moment-timezone";
import sendMail from "./emailer";
import cron from "node-cron";

// In case client/patient did not finish the survey in time (before midnight that is)
// then this cron job will update the database that the user missed the survey
const updateMissedJob = () =>
  // runs everyday on midnight
  cron.schedule("0 59 23 * * *", async function () {
    const treatments = await db
      .query(
        `SELECT client_id,reminders FROM treatment WHERE status='on-going'`
      )
      .then(({ rows }) => rows);

    treatments.forEach(async (treatment) => {
      const clientSurveys = await db
        .query(
          `SELECT * from clients_surveys WHERE client_id = $1 AND is_done = 'false' AND has_missed = 'false'`,
          // in the future if a client can have multiple treatments, then this
          // needs to be more specific
          [treatment.client_id]
        )
        .then(({ rows }) => rows);

      clientSurveys.forEach((survey) => {
        const currDate = moment(moment().toDate()).format("L");

        const surveyDate = moment(survey.survey_date).format("L");

        if (currDate === surveyDate) {
          db.query(
            `UPDATE clients_surveys SET has_missed = 'true' WHERE id = $2`,
            [survey.id]
          );
        }
      });

      // resetting reminders
      const reminders = treatment.reminders.map((reminder) => ({
        ...reminder,
        has_sent: false,
      }));

      db.query(`UPDATE treatment SET reminders = $1 ON id = $2`, [
        JSON.stringify(reminders),
        treatment.id,
      ]);
    });
  });

// A cron job that runs every 5 minutes to check which clients/patients have surveys today
// and decide when to send them a reminder for it (currently only supports email)
const remindersJob = () =>
  cron.schedule("5 * * * * *", async function () {
    try {
      const treatments = await db
        .query(`SELECT * FROM treatment WHERE status='on-going'`)
        .then(({ rows }) => rows);

      treatments.forEach(async (treatment) => {
        const clientSurveys = await db
          .query(
            `SELECT * from clients_surveys WHERE client_id = $1 AND is_done = 'false' AND has_missed = 'false'`,
            [treatment.client_id]
          )
          .then(({ rows }) => rows);

        if (clientSurveys.length == 0) return;

        const currDate = moment(moment().toDate()).format("L");
        // 1 survey is enough indication to know when to show the client/patient
        // a reminder
        const surveyDate = moment(clientSurveys[0].survey_date).format("L");

        var sent = false;
        if (currDate === surveyDate) {
          console.log("in");
          treatment.reminders.forEach(async (reminder) => {
            if (sent) {
              return;
            }

            const reminderTime = moment().tz("Asia/Jerusalem");
            // for example reminderTime -> 14:30
            const [hour, minute] = reminder.time.split(":").map((x) => +x);

            reminderTime.set({
              hour,
              minute,
              second: 0,
              millisecond: 0,
            });
            if (
              !reminder.has_sent &&
              moment().tz("Asia/Jerusalem").isSameOrAfter(reminderTime)
            ) {
              // remove the reminder from the reminders array so later
              // we can add it with has_sent true
              let reminders = treatment.reminders.filter(
                (tempReminder) => tempReminder.time !== reminder.time
              );

              reminders = [
                ...reminders,
                { time: reminder.time, has_sent: true },
              ];

              db.query("UPDATE treatment SET reminders = $1 WHERE id = $2", [
                JSON.stringify(reminders),
                treatment.id,
              ]);

              // send email
              const { MAIL_USERNAME } = process.env;

              const clientData = await db
                .query(`SELECT * FROM clients WHERE id = $1`, [
                  treatment.client_id,
                ])
                .then(({ rows }) => rows[0]);

              // formatting all client surveys to <li></li> elements
              const surveyList = await Promise.all(
                clientSurveys.map(async (survey) => {
                  const surveyData = await db
                    .query(`SELECT * FROM surveys WHERE id=$1`, [
                      survey.survey_id,
                    ])
                    .then(({ rows }) => rows[0]);
                  return `<li>${surveyData.name}</li>`;
                })
              );
              // calculating time left
              const midnight = moment().set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 0,
              });

              const now = moment();
              const timeDifference = midnight.diff(now);
              const tempTime = moment.duration(timeDifference);
              const hour =
                tempTime.hours() <= 9 && tempTime.hours() >= 0
                  ? "0" + tempTime.hours()
                  : tempTime.hours();
              const minute =
                tempTime.minutes() <= 9 && tempTime.minutes() >= 0
                  ? "0" + tempTime.minutes()
                  : tempTime.minutes();
              const remainingTime = hour + ":" + minute;

              const mailOptions = {
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
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

export default { updateMissedJob, remindersJob };
