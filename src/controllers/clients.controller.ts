import { fetchClients, newClient } from "../models/users.models";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

const allClients = catchAsync(async (req, res) => {
  const clients = await fetchClients();

  res.status(httpStatus.OK).send(clients);
});

//add client
const addClient = catchAsync(async (req: any, res: any) => {
  const { condition, phone, email, name, gender, startDate, protocol } = req.body;

  if (!condition || !phone || !email || !name || !gender || !startDate || !protocol) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data");
  }

  await newClient(req.body);
  res.status(httpStatus.OK).send({ success: true });
});
//hide client

//edit client

export default {
  list: allClients,
  add: addClient,
};
