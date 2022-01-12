import express from "express";

import generalController from "./controllers/general";
import clientController from "./controllers/clients.controller";
import clinicController from "./controllers/clinics.controller";

const router = express.Router();

router.get("/", generalController.home);
router.get("/client/survey/:id", generalController.getSurveyById);
router.get("/clients", clientController.list);
router.post("/client/login", clientController.login);
router.post("/client/register", clientController.register);
router.post("/client/getPasscode", clinicController.sendPasscode);
router.post("/clinic/survey/add", generalController.addSurvey);
router.get("/clinic/client/:id", clinicController.getClientData);
router.get("/clinic/protocols", clinicController.getProtocols);
router.get("/clinic/surveys", clinicController.getSurveys);

export default router;
