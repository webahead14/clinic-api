import express from "express";

import generalController from "./controllers/general";
import clientController from "./controllers/clients.controller";

const router = express.Router();

router.get("/", generalController.home);
router.get("/client/survey/:id", generalController.survey.getSurveyById);
router.get("/clients", clientController.list);
router.post("/clientLogin", clientController.login);

export default router;
