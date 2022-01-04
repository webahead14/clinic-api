var CronJob = require("cron").CronJob;
import db from "../database/connection";

let job = new CronJob(
  "0 0 0 ? * * *",
  function () {
    console.log("You will see this message every second");
    const clients = db
      .query(`SELECT client_id FROM treatment WHERE status='on-going'`)
      .then(({ rows }) => {
        return rows;
      });
    clients.forEach((client) => {
      db.query(
        `SELECT * from clients_surveys WHERE client_id = $1 AND is_done = False AND has_missed = False`,
        [client]
      ).then(({ rows }) => {});
    });
  },
  null,
  true,
  "Israel"
);
export default job;
