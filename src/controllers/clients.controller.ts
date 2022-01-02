import { fetchClients } from "../models/users.models";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

const allClients = catchAsync(async (req, res) => {
  const clients = await fetchClients();

  res.status(httpStatus.OK).send(clients);
});

//add client

//hide client

//edit client

export default {
  list: allClients,
};
