// import { HsapResponse } from '../types';

// const getErrorBodyAndHeaders = (
//   defaultError: string,
//   message?: string | Record<string, unknown> | unknown | null
// ) => {
//   return {
//     body: {
//       message: message && typeof message === 'string' ? message : defaultError,
//       validationError:
//         message && typeof message !== 'string' ? message : undefined,
//     },
//   };
// };

// const getSuccessBodyAndHeaders = (
//   defaultSuccess: string,
//   message?: string | Record<string, unknown> | null
// ) => {
//   return {
//     body: {
//       message:
//         message && typeof message === 'string' ? message : defaultSuccess,
//       data:
//         message && typeof message !== 'string' && message.data
//           ? message.data
//           : message && typeof message !== 'string'
//           ? message
//           : undefined,
//     },
//   };
// };

// const validationError = (
//   message?: string | Record<string, unknown> | unknown | null
// ): HsapResponse => ({
//   statusCode: 400,
//   ...getErrorBodyAndHeaders('Validation Error', message),
// });

// const internalError = (
//   message?: string | Record<string, unknown> | unknown | null
// ): HsapResponse => ({
//   statusCode: 500,
//   ...getErrorBodyAndHeaders('Internal Error', message),
// });

// const forbiddenError = (
//   message?: string | Record<string, unknown> | unknown | null
// ): HsapResponse => ({
//   statusCode: 403,
//   ...getErrorBodyAndHeaders('Forbidden', message),
// });

// const notFoundError = (
//   message?: string | Record<string, unknown> | unknown | null
// ): HsapResponse => ({
//   statusCode: 404,
//   ...getErrorBodyAndHeaders('Not Found', message),
// });

// const unauthorizedError = (
//   message?: string | Record<string, unknown> | unknown | null
// ): HsapResponse => ({
//   statusCode: 401,
//   ...getErrorBodyAndHeaders('Unauthorized', message),
// });

// const success = (
//   message?: string | Record<string, unknown> | null
// ): HsapResponse => ({
//   statusCode: 200,
//   ...getSuccessBodyAndHeaders('Ok', message),
// });

// const created = (
//   message?: string | Record<string, unknown> | null
// ): HsapResponse => ({
//   statusCode: 201,
//   ...getSuccessBodyAndHeaders('Ok', message),
// });

// export {
//   validationError,
//   internalError,
//   forbiddenError,
//   unauthorizedError,
//   notFoundError,
//   success,
//   created,
// };
