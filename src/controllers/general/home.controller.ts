import { Request, Response } from "express";
import { catchAsync } from "../../utils";

export default catchAsync(async (req: Request, res: Response) => {
  res.send("Hello world");
});
