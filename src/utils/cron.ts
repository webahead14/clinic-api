var CronJob = require("cron").CronJob;
import db from "../database/connection";
import moment from "moment";

let job = new CronJob(
  "0 0 0 ? * * *",
  async function () {
    const clients = await db
      .query(`SELECT client_id FROM treatment WHERE status='on-going'`)
      .then(({ rows }) => rows);
    clients.forEach(async (client) => {
      const clientData = await db
        .query(
          `SELECT * from clients_surveys WHERE client_id = $1 AND is_done = 'false' AND has_missed = 'false'`,
          [client]
        )
        .then(({ rows }) => rows);
      if (moment().toDate() === clientData.survey_date) {
        db.query(
          `UPDATE clients_surveys SET has_missed = 'true' WHERE client_id = $1`,
          [client]
        );
      }
    });
  },
  null,
  true,
  "Israel"
);
export default job;
