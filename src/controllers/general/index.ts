import homeController from "./home.controller";
import surveyController from "./survey.controller";

export default {
  home: homeController,
  getSurveyById: surveyController.getSurveyById,
  addSurvey: surveyController.addSurvey,
};
