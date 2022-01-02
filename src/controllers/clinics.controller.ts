import { catchAsync, ApiError } from '../utils';
import { fetchProtocols, fetchSurveys } from '../models/clinics.models';
import httpStatus from 'http-status';

const getAllProtocols = catchAsync(async (req, res) => {
  const data = await fetchProtocols();
  if (!data.length)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Unable to fetch protocols'
    );
  else {
    res.status(httpStatus.OK).send({ protocols: data });
  }
});

const getAllSurveys = catchAsync(async (req, res) => {
  const data = await fetchSurveys();
  if (!data.length)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Unable to fetch surveys'
    );
  else {
    res.status(httpStatus.OK).send({ surveys: data });
  }
});

export default { getProtocols: getAllProtocols, getSurveys: getAllSurveys };
