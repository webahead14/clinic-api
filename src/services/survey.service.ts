const matrixData = [
  {
    id: "matrixblahid",
    title: "do you feel bothered from:",
    columns: ["Poorly", "Semi-Poorly", "Avarage", "Semi-Strongly", "Strongly"],
    answers: ["0", "1", "2", "3", "4"],
    instructions:
      "Below is a list of problems and complaints that people sometimes have in response to stressful life experiences. How much you have been bothered by that problem IN THE LAST MONTH.",
  },
];

const questionsData = [
  {
    id: "1",
    question:
      "Feeling very upset when something reminds you of the stressful experience?",
    type: "matrix",
    group: "group_xyz",
    matrix_id: "1",
    extra_data: {},
  },
  {
    id: "2",
    question:
      "Trouble remembering important parts of the stressful experience?",
    type: "matrix",
    group: "group_xyz",
    matrix_id: "1",
    extra_data: {},
  },
  {
    id: "3",
    question: "Loss of interest in activities that you used to enjoy?",
    type: "matrix",
    group: "group_xyz",
    matrix_id: "1",
    extra_data: {},
  },
  {
    id: "4",
    question: "Irritable behaviour, angry outbursts, or acting aggressively?",
    type: "matrix",
    group: "group_xyz",
    matrix_id: "1",
    extra_data: {},
  },
  {
    id: "5",
    question:
      "Which choice of the choices below you think it will impact you stress the most?",
    type: "multiple_choice",
    group: "group_xyz_multi1",
    matrix_id: "",
    extra_data: {
      multipleChoice: {
        choiceType: "Radio",
        answers: [
          {
            text: "Smoke",
          },
          {
            text: "Exercise",
          },
          {
            text: "Drink alcohol",
          },
          {
            text: "Eat",
          },
        ],
      },
    },
  },
  {
    id: "6",
    question: "Mark the type of pains you've encountered lately:",
    type: "multiple_choice",
    group: "group_xyz_multi2",
    matrix_id: "",
    extra_data: {
      multipleChoice: {
        choiceType: "Checkbox",
        answers: [
          {
            text: "Physical Pain",
          },
          {
            text: "Mental Pain",
          },
          {
            text: "Spiritual Pain",
          },
        ],
      },
    },
  },
  {
    id: "7",
    question: "Anything else?",
    type: "open_text",
    group: "group_xyz_open",
    matrix_id: "",
    extra_data: {
      openText: {
        inputPlaceholder: "Please write the answer here",
      },
    },
  },
];

const fetchSurveyData = () => {
  return {};
};
