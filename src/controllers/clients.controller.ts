import { fetchClients, newClient, getClient } from "../models/users.models";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET = process.env.JWT_SECRET;

const allClients = catchAsync(async (req, res) => {
  const clients = await fetchClients();

  res.status(httpStatus.OK).send(clients);
});

//add client
const addClient = catchAsync(async (req: any, res: any) => {
  const { condition, phone, email, name, gender, startDate, protocol } =
    req.body;

  if (
    !condition ||
    !phone ||
    !email ||
    !name ||
    !gender ||
    !startDate ||
    !protocol
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data");
  }

  await newClient(req.body);
  res.status(httpStatus.OK).send({ success: true });
});
//hide client

//edit client
//login client
const loginClient = catchAsync(async (req: any, res: any) => {
  const { gov_id, passcode } = req.body;

  if (!gov_id || !passcode) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data");
  }

  const client = await getClient(gov_id);
  if (client.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No client found");
  }
  const dbPassword = client[0].passcode;
  bcrypt.compare(passcode, dbPassword).then((match) => {
    if (!match) {
      res.send({ status: "wrong password" });
    } else {
      const token = jwt.sign({ gov_id: gov_id, name: client[0].name }, SECRET);
      const response = {
        name: client[0].name,
        gov_id: client[0].gov_id,
        access_token: token,
      };
      res.status(httpStatus.OK).send(response);
    }
  });
});
export default {
  list: allClients,
  add: addClient,
  login: loginClient,
};
