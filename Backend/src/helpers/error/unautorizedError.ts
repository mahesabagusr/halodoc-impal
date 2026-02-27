import CommonError from "./commonError";

class Unauthorized extends CommonError {
  constructor(message: string) {
    super(message || "Unauthorized");
  }
}

export default Unauthorized;
