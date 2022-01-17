import fetchSurveyData from "../../services/survey.service";
import {
  fetchSurveyById,
  setSurvey,
  fetchSurveyByName,
  setMatrix,
  setQuestions,
  attachQuestionsToSurvey,
  addAnswers,
  isOngoing,
  fetchAvaliableSurveys,
  fetchSurveyDataById,
} from "../../models/surveys.models";
import { catchAsync, ApiError, updateMatrices } from "../../utils";
import httpStatus from "http-status";
import moment from "moment";

const getAvaliableSurveys = catchAsync(async (req, res) => {
  let surveys = [];
  const clientId = req.params.id;
  if (!(await isOngoing(clientId))) {
    res
      .status(httpStatus.BAD_REQUEST)
      .send({ status: "No on-going treatments for client" });
  }

  const clientSurveys = await fetchAvaliableSurveys(clientId);
  const currDate = moment(moment().toDate()).format("L");

  await Promise.all(
    clientSurveys.map(async (survey) => {
      const surveyData = await fetchSurveyDataById(survey.survey_id);
      const surveyDate = moment(survey.survey_date).format("L");
      // keep it under comment for presentations
      // if (currDate == surveyDate) {
      const response = {
        surveyId: survey.id,
        surveyName: surveyData[0].name,
      };
      surveys.push(response);
      return surveys;
      // }
      return null;
    })
  );
  res.status(httpStatus.OK).send(surveys);
});

const getSurveyById = catchAsync(async (req, res) => {
  const id = req.params.id;
  const language = req.body.language;
  try {
    const data = await fetchSurveyById(id);
    if (language !== "en") {
      data.survey_snapshot = await fetchSurveyData(data.survey_id, language);
    }

    if (data.is_done)
      throw new ApiError(httpStatus.BAD_REQUEST, "Survey already done");

    if (data.has_missed)
      throw new ApiError(httpStatus.BAD_REQUEST, "Survey was missed");

    res.status(httpStatus.OK).send(data.survey_snapshot);
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `${err}`);
  }
});

const insertAnswers = catchAsync(async (req, res) => {
  const answers = req.body;
  let multipeRows = "";
  answers.map((element, index) => {
    multipeRows += `(${element.answers},${element.question_id})`;
    index == answers.length - 1 ? (multipeRows += ";") : (multipeRows += ",");
  });
  await addAnswers(multipeRows);
  res.send({ status: "success" });
});

const addSurvey = catchAsync(async (req, res) => {
  const data = req.body;

  try {
    const result = await fetchSurveyByName(data.survey); //result is array of queries has the same name of survey(data.survey)

    if (result.length > 0)
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `The survey name: '${data.survey}' does exist`
      );

    const surveyID = await setSurvey(data.survey);

    let questions = [],
      matrices = [];
    for (const q of data.questions) {
      //create multiple choice question and push it to questions array.
      if (q.type === "multiple_choice") {
        const question = {
          matrixID: null,
          type: "multiple_choice",
          group: q.group,
          question: q.question,
          extra_data: JSON.stringify({
            multipleChoice: {
              choiceType: q.multipleChoice.choiceType,
              answers: q.multipleChoice.answers,
            },
          }),
        };
        questions.push(question);
      }

      //create open text question and push it to questions array.
      if (q.type === "open_text") {
        const question = {
          matrixID: null,
          type: "open_text",
          group: q.group,
          question: q.question,
          extra_data: null,
        };
        questions.push(question);
      }

      //create matrix structure
      if (q.type === "matrix") {
        const matrix = {
          matrixQuestions: [q.question],
          title: q.matrixFormat.title,
          columns: q.matrixFormat.columns,
          answers: q.matrixFormat.answers,
          instructions: q.matrixFormat.instructions,
          matrixGroup: q.group, //unique name for multiple question in the same matrix.
        };
        updateMatrices(matrices, matrix); //update matrices and it questions.
      }
    }

    //iterate over all matrices, create every matrix individually, then concate it questions to questions array.
    for (const mat of matrices) {
      const matrix = {
        title: mat.title,
        columns: JSON.stringify(mat.columns),
        answers: JSON.stringify(mat.answers),
        instructions: mat.instructions,
      };
      const matrixID = await setMatrix(matrix);
      for (const q of mat.matrixQuestions) {
        const question = {
          matrixID: matrixID,
          type: "matrix",
          group: mat.matrixGroup,
          question: q,
          extra_data: null,
        };
        questions.push(question);
      }
    }

    //add the questions to questions table then tie each one to the surveyID and insert it to questions_surveys table.
    for (const question of questions) {
      const questionID = await setQuestions(question);
      await attachQuestionsToSurvey(questionID, surveyID);
    }
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `${err}`);
  }

  res
    .status(httpStatus.OK)
    .send("The survey and it questions has been created successfully.");
});

export default { getSurveyById, addSurvey, insertAnswers, getAvaliableSurveys };
