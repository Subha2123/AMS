import { CONST_STATUS_CODE } from "./statusCode.js";

const validationError = (message) => ({
  type: 'validation',
  statusCode: CONST_STATUS_CODE.BAD_REQUEST,
  message
});

const notFoundError = (message) => ({
  type: 'Not Found',
  statusCode: CONST_STATUS_CODE.NOT_FOUND,
  message
});

const serverError = (message) => ({
  type: 'server',
  statusCode: CONST_STATUS_CODE.INTERNAL_SERVER_ERROR,
  message: message || 'Internal Server Error'
});

const conflictError=(message)=>({
  type: 'conflict',
  statusCode: CONST_STATUS_CODE.CONFLICT,
  message: message || 'Internal Server Error'
})

export { validationError, notFoundError , serverError , conflictError }