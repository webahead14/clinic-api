import homeController from "./home.controller";
import surveysController from "./surveys.controller";
import protocolsController from "./protocols.controller";

export default {
  home: homeController,
  getSurveyById: surveysController.getSurveyById,
  addSurvey: surveysController.addSurvey,
  createProtocol: protocolsController.createProtocol,
  avaliableSurveys: surveysController.getAvaliableSurveys,
};
