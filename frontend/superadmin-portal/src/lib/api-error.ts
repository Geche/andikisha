export class ApiError extends Error {
  constructor(
    message: string,
    public readonly data: unknown,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}
