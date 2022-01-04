import { Request, Response } from "express";
import { catchAsync } from "../../utils";
import { fetchSurveyById } from "../../models/survey";

export default catchAsync(async (req: Request, res: Response) => {
  res.send("Hello world");
});
