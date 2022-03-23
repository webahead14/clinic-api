import homeController from "./home.controller";
import surveysController from "./surveys.controller";
import protocolsController from "./protocols.controller";
import AppointmentsController from "./Appointments.controller";
export default {
  home: homeController,
  getSurveyById: surveysController.getSurveyById,
  addSurvey: surveysController.addSurvey,
  createProtocol: protocolsController.createProtocol,
  avaliableSurveys: surveysController.getAvaliableSurveys,
  addAppointments: AppointmentsController.addAppointments,
};
