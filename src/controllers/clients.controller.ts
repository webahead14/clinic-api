import { fetchClients, getClient } from "../models/clients.models";
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

//edit client
//login client
const loginClient = catchAsync(async (req: any, res: any) => {
  const { gov_id, passcode } = req.body;

  if (!gov_id || !passcode) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing data");
  }

  const client = await getClient(gov_id);
  if (client.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No client found");
  }
  const dbPassword = client.passcode;
  bcrypt.compare(passcode, dbPassword).then((match) => {
    if (!match) {
      return res.send({ status: "wrong password" });
    } else {
      const token = jwt.sign(
        { name: client.name, id: client.id },
        { expiresIn: "24h" },
        SECRET
      );
      const response = {
        name: client.name,
        gov_id: client.gov_id,
        access_token: token,
      };
      res.status(httpStatus.OK).send(response);
    }
  });
});
export default {
  list: allClients,
  login: loginClient,
};
