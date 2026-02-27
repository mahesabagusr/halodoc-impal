
import CommonError from "./commonError";

class ExpectationFailedError extends CommonError {
  constructor(message : string) {
    super(message || 'Expectation Failed');
  }
}

export default ExpectationFailedError;
