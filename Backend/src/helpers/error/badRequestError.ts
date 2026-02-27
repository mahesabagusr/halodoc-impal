import CommonError from "./commonError";

export default class BadRequestError extends CommonError {
  constructor(message: string) {
    super(message || "Bad Request");
  }
}
