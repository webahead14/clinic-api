import express from "express";

import generalController from "./controllers/general";
import clientController from "./controllers/clients.controller";
import clinicController from "./controllers/clinics.controller";
import AppointmentsController from "./controllers/general/Appointments.controller";

const router = express.Router();

router.get("/", generalController.home);
router.post("/client/survey/:id", generalController.getSurveyById);
router.get("/clients", clientController.list);
router.post("/client/login", clientController.login);
router.post("/client/register", clientController.register);
router.post("/client/getPasscode", clinicController.sendPasscode);
router.post("/clinic/survey/add", generalController.addSurvey);
router.post("/clinic/protocol/add", generalController.createProtocol);
router.get("/clinic/client/:id", clinicController.getClientData);
router.get("/clinic/protocols", clinicController.getProtocols);
router.get("/clinic/surveys", clinicController.getSurveys);
router.post("/clinic/client/update", clinicController.updateClientData);
router.get("/client/surveys/:id", generalController.avaliableSurveys);
router.get("/clinic/Appointments", AppointmentsController.getAppointments);
router.post("/clinic/Appointment/add", generalController.addAppointments);

export default router;
