import CommonError from "./commonError";

class InternalServerError extends CommonError {
  constructor(message: string) {
    super(message || "Internal Server Error");
  }
}

export default InternalServerError;
