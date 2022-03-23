import db from "../database/connection";

export function addAppointment(a) {
  const appointment = [
    a.appointment_date,
    a.start_Hour,
    a.end_Hour,
    a.client_id,
  ];

  return db.query(
    `INSERT INTO Appointments
            (appointment_date,start_Hour,end_Hour,client_id)VALUES($1,$2,$3,$4)`,
    appointment
  );
}

export function fetchAppointments() {
  return db
    .query(
      `SELECT name as patient, appointment_date as date,start_hour,end_hour
      FROM appointments
      INNER JOIN clients ON appointments.client_id = clients.id `
    )
    .then((appointments) => appointments.rows);
}
