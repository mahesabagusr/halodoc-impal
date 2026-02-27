import CommonError from "./commonError";

class ServiceUnavailableError extends CommonError {
  constructor(message: string) {
    super(message || "Service Unavailable");
  }
}

export default ServiceUnavailableError;
