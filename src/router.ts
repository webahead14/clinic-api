import express from "express";

import generalController from "./controllers/general";

const router = express.Router();

router.get("/", generalController.home);
router.get("/client/survey/:id", generalController.survey.getSurveyById);
export default router;
