import express from "express";

import generalController from "./controllers/general";
import clientController from "./controllers/clients.controller";
import { fetchSurveyData } from "./services/survey.service";

const router = express.Router();

router.get("/", generalController.home);
router.get("/client/survey/:id", generalController.survey.getSurveyById);
router.get("/clients", clientController.list);
router.get("/test", (req, res) => fetchSurveyData());

export default router;
