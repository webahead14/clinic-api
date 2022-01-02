import { Request, Response } from "express";
import { catchAsync } from "../../utils";
import { fetchSurveyById } from "../../models/survey";

export default catchAsync(async (req: Request, res: Response) => {
  console.log(await fetchSurveyById(1));
  res.send("Hello world");
});
