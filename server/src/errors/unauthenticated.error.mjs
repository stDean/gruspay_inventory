import  CustomAPIError from "./custom-error.mjs";
import  { StatusCodes } from "http-status-codes";

class UnauthenticatedError extends CustomAPIError {
	constructor(message) {
		super(message);
		this.statusCode = StatusCodes.UNAUTHORIZED;
	}
}

export default UnauthenticatedError;
