import CommonError from "./commonError";

class NotFoundError extends CommonError {
  constructor(message: string) {
    super(message || "Not Found");
  }
}

export default NotFoundError;
