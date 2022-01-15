import {
  fetchMatrixById,
  fetchQuestionsBySurveyId,
} from "../models/surveys.models";

export const fetchSurveyData = async (surveyId: number = 1) => {
  const groupsFound = [];
  let questionsData = await fetchQuestionsBySurveyId(surveyId);
  let survey = await Promise.all(
    questionsData.map(async (data) => {
      if (data.type === "matrix") {
        const matrixData = await fetchMatrixById(data.matrix_id);

        const isGroupFound = groupsFound.findIndex(
          (element) => element === data.group
        );

        if (isGroupFound !== -1 || !matrixData.length) {
          return null;
        }
        groupsFound.push(data.group);
        const questionsArr = questionsData
          .map((element) => {
            if (element.group === data.group) {
              return { id: element.id, question: element.question };
            }
            return null;
          })
          .filter((x) => x);

        return {
          type: data.type,
          group: data.group,
          title: matrixData[0].title,
          columns: matrixData[0].columns,
          answers: matrixData[0].answers,
          instructions: matrixData[0].instructions,
          questions: questionsArr,
        };
      }

      if (data.type === "multiple_choice") {
        return {
          id: data.id,
          type: data.type,
          question: data.question,
          ...data["extra_data"].multipleChoice,
        };
      }

      if (data.type === "open_text") {
        return {
          id: data.id,
          type: data.type,
          question: data.question,
          placeholder: data.extra_data.openText.inputPlaceholder,
        };
      }

      return null;
    })
  );
  survey = survey.filter((x) => x);
  return survey;
};
export default fetchSurveyData;
