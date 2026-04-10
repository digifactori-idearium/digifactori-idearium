import { Response } from 'express';
import { ZodError } from 'zod';

/**
 * Validation error response structure
 */
export interface ValidationErrorResponse {
  status: 'error';
  status_code: 400;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Handles Zod validation errors and sends error response
 *
 * @param error - Zod validation error
 * @param res - Express response object
 * @returns true if error was handled, false otherwise
 *
 * @example
 * const result = await schema.safeParseAsync(req.body);
 * if (!result.success) {
 *   return handleValidationError(result.error, res);
 * }
 */
export const handleValidationError = (error: ZodError, res: Response): true => {
  const errors = error.issues.map(issue => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));

  const response: ValidationErrorResponse = {
    status: 'error',
    status_code: 400,
    errors,
  };

  res.status(400).json(response);
  return true;
};

/**
 * Helper function to check and handle validation errors before processing
 * Reduces boilerplate in controllers
 *
 * @example
 * const result = await schema.safeParseAsync(req.body);
 * if (failOnValidation(result, res)) return;
 * // Continue with validated data
 * const { email, password } = result.data;
 */
export const failOnValidation = (
  result: { success: boolean; error?: ZodError },
  res: Response
): boolean => {
  if (!result.success) {
    handleValidationError(result.error!, res);
    return true;
  }
  return false;
};

export default handleValidationError;
