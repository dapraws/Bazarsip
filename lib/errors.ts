/**
 * Errors whose message is safe — and useful — to show the caller, such as
 * "Insufficient stock". Anything else is unexpected and gets a generic
 * response so internal details stay in the server log.
 */
export class UserError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "UserError";
  }
}
