import {
  fetchClients,
  addClient,
  createTreatment,
  attachSurveysToClient,
  getClientByGovId,
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

  const checkExists = await getClientByGovId(govId);

  if (checkExists)
    throw new ApiError(httpStatus.BAD_REQUEST, "client already exists");

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(passcode, salt);
  const temPasscode = hash; //initialize in sql query just as dummy data.

  const client = {
    passcode,
    temPasscode,
    govId,
    condition,
    phone,
    email,
    name,
    gender,
  };
  client.passcode = hash;
  const clientId = await addClient(client);
  const treatmentId = await createTreatment(clientId, protocolId, startDate);
  await attachSurveysToClient(protocolId, clientId, treatmentId);
  res.status(httpStatus.OK).send({ success: true });
});
//edit client
//login client
const loginClient = catchAsync(async (req: any, res: any) => {
  const { govId, passcode } = req.body;
  if (!govId || !passcode) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data");
  }

  const client = await getClientByGovId(govId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, "Identity number is incorrect");
  }

  const dbPasscode = client.passcode;
  const dbTempPasscode = client.time_passcode;
  const expiresIn = client.time_passcode_expiry;

  // try/catch the compareSync in the if statement
  const isPasscode = bcrypt.compareSync(passcode, dbPasscode);
  const compareTempPasscode = bcrypt.compareSync(passcode, dbTempPasscode);
  console.log(compareTempPasscode);
  console.log(passcode);
  console.log(dbTempPasscode);

  let isTempPasscode = false;
  if (new Date() < expiresIn && compareTempPasscode) {
    isTempPasscode = true;
  }

  if (!isPasscode && !isTempPasscode) {
    throw new ApiError(httpStatus.NOT_FOUND, "Password is incorrect ");
  } else {
    const token = jwt.sign({ name: client.name, id: client.id }, SECRET, {
      expiresIn: 60 * 60 * 24,
    });

    const response = {
      name: client.name,
      govId: govId,
      access_token: token,
      status: "success",
    };
    res.status(httpStatus.OK).send(response);
  }
});

export default {
  list: allClients,
  login: loginClient,
  register: createClient,
};
