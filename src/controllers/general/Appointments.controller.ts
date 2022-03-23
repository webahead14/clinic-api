import { addAppointment } from "../../models/appointments.models";
import { ApiError, catchAsync, deleteProps } from "../../utils";
import httpStatus from "http-status";
import { Request, Response } from "express";
import { fetchAppointments } from "../../models/appointments.models";

const addAppointments = catchAsync(async (req: Request, res: Response) => {
  let cl = JSON.parse(req.body.clientJSON);
  let id = cl.id;
  let appointmentsArray = cl.ap;

  appointmentsArray.forEach(async (element: any) => {
    await addAppointment({
      appointment_date: element.date.toLocaleString("he-il"),
      start_Hour: element.hours[0],
      end_Hour: element.hours[1],
      client_id: id,
    });
  });
  res.send("ok");
});

// Get a list of all Appointments
const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
  const AppointmentsList = await fetchAppointments();

  if (!AppointmentsList.length)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to fetch Appointments"
    );

  for (let appointment of AppointmentsList) {
    appointment.Date;
    const yyyy = appointment.date.getFullYear();
    let mm = appointment.date.getMonth() + 1; // Months start at 0!
    let dd = appointment.date.getDate();

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;

    const AppointmentDate = dd + "-" + mm + "-" + yyyy;
    appointment.date = AppointmentDate;

    appointment.hours =
      appointment.start_hour
        .toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })
        .substring(0, 5) +
      " - " +
      appointment.end_hour
        .toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })
        .substring(0, 5);

    deleteProps(appointment, ["start_hour", "end_hour"]);
  }

  res.status(httpStatus.OK).send({ Appointments: AppointmentsList });
});
export default { addAppointments, getAppointments: getAllAppointments };
