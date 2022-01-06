import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { fetchProtocols } from "../models/clinics.models";

const getAllProtocols = catchAsync(async (req, res) => {
  const data = await fetchProtocols();
  if (!data.length)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to fetch protocols"
    );
  else {
    res.status(httpStatus.OK).send(data);
  }
});

export default {
  getAllProtocols,
};
