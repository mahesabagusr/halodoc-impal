import CommonError from "./commonError";

export default class ConflictError extends CommonError {
  constructor(message: string) {
    super(message || "Conflict");
  }
}

