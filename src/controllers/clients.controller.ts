import {
  fetchClients,
  getClient,
  addClient,
  createTreatment,
  attachSurveysToClient,
} from "../models/clients.models";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET = process.env.JWT_SECRET;

const allClients = catchAsync(async (req: any, res: any) => {
  const clients = await fetchClients();

  res.status(httpStatus.OK).send(clients);
});
//create client
const createClient = catchAsync(async (req: any, res: any) => {
  const {
    passcode,
    govId,
    condition,
    phone,
    email,
    name,
    gender,
    protocolId,
    startDate,
  } = req.body;

  // const protocolId = (await getClient(protocolName))[0];

  if (
    !passcode ||
    !govId ||
    !condition ||
    !phone ||
    !email ||
    !name ||
    !gender ||
    !protocolId ||
    !startDate
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data");
  }

  const checkExists = (await getClient(govId))[0];

  if (checkExists)
    throw new ApiError(httpStatus.BAD_REQUEST, "client already exists");

  const client = {
    passcode,
    govId,
    condition,
    phone,
    email,
    name,
    gender,
    protocolId,
  };
  const clientId = await addClient(client);
  const treatmentId = await createTreatment(clientId, protocolId, startDate);
  await attachSurveysToClient(protocolId, clientId, treatmentId);
  res.status(httpStatus.OK).send({ success: true });
});
//edit client
//login client
const loginClient = catchAsync(async (req: any, res: any) => {
  const { gov_id, passcode } = req.body;
  if (!gov_id || !passcode) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data");
  }

  const client = await getClient(gov_id);
  if (!client) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No client found");
  }

  const dbPassword = client.passcode;

  bcrypt.compare(passcode, dbPassword).then((match) => {
    if (!match) {
      return res.send({ status: "wrong password" });
    } else {
      const token = jwt.sign({ name: client.name, id: client.id }, SECRET, {
        expiresIn: 60 * 60 * 24,
      });

      const response = {
        name: client.name,
        gov_id: client.gov_id,
        access_token: token,
        status: "success",
      };
      res.status(httpStatus.OK).send(response);
    }
  });
});

export default {
  list: allClients,
  login: loginClient,
  register: createClient,
};
