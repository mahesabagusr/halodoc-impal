import CommonError from "./commonError";

class ForbiddenError extends CommonError {
  constructor(message : string) {
    super(message || "Forbidden");
  }
}

export default ForbiddenError;
