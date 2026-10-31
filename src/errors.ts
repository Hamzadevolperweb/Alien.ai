export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function configError(name: string): ApiError {
  return new ApiError(503, "CONFIGURATION_ERROR", `${name} is not configured.`);
}
