import { Request, Response } from "express";
import { catchAsync } from "../../utils";
import { fetchQuestionsBySurveyId, fetchMatrixById } from "../../models/survey";

export default catchAsync(async (req: Request, res: Response) => {
  fetchQuestionsBySurveyId(1);
  fetchMatrixById(1);
  res.send("Hello world");
});
