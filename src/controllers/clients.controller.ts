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
    reminders,
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
    !startDate ||
    !reminders
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
    protocolId,
  };
  client.passcode = hash;
  const clientId = await addClient(client);
  const treatmentId = await createTreatment(
    clientId,
    protocolId,
    startDate,
    reminders
  );
  await attachSurveysToClient(protocolId, clientId, treatmentId, startDate);
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
    throw new ApiError(httpStatus.UNAUTHORIZED, "Identity number is incorrect");
  }

  const dbPasscode = client.passcode;
  const dbTempPasscode = client.time_passcode;
  const expiresIn = client.time_passcode_expiry;

  try {
    const isPasscode = bcrypt.compareSync(passcode, dbPasscode);
    const compareTempPasscode = bcrypt.compareSync(passcode, dbTempPasscode);
    let isTempPasscode = false;
    if (new Date() < expiresIn && compareTempPasscode) {
      isTempPasscode = true;
    }

    if (!isPasscode && !isTempPasscode) {
      if (compareTempPasscode) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Passcode access time is expired."
        );
      }
      throw new ApiError(httpStatus.UNAUTHORIZED, "Passcode is incorrect.");
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
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, `${err}`);
  }
});

export default {
  list: allClients,
  login: loginClient,
  register: createClient,
};
