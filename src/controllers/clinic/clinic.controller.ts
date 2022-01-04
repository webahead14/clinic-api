import {
  getClient,
  fetchSurveys,
  getTreatment,
  getProtocol,
} from "../../models/clients.models";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";

const getData = catchAsync(async (req: any, res: any) => {
  const gov_id = req.params.id;

  const client = (await getClient(gov_id))[0]; //gets all client info

  if (!client) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No client found");
  }
  console.log("client", client);
  const treatment = await getTreatment(client.id);
  if (!treatment) {
    const response = {
      client: client,
      status: "success",
    };
    res.status(httpStatus.OK).send(response);
  }
  const protocol = await getProtocol(client.condition);
  console.log("treat", treatment);
  const surveys = await fetchSurveys(client.id, treatment.id);
  if (!surveys) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No surveys");
  }
  const response = {
    client: client,
    surveys: surveys,
    protocol: protocol,
    status: "success",
  };
  res.status(httpStatus.OK).send(response);
});

export default { data: getData };
