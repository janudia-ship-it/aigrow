export class ApiError extends Error {
  public errorCode: number;
  public status: number;
  public details?: unknown;

  constructor(message: string, errorCode: number = 0, status: number = 400, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.errorCode = errorCode;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

