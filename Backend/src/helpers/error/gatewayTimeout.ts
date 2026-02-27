import CommonError from "./commonError";

class GatewayTimeoutError extends CommonError {
  constructor(message: string) {
    super(message || "Gateway Timeout");
  }
}

export default GatewayTimeoutError;
