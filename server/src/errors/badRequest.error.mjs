import CustomAPIError from "./custom-error.mjs";
import { StatusCodes } from "http-status-codes";

class BadRequestError extends CustomAPIError {
	constructor(message) {
		super(message);
		this.statusCode = StatusCodes.BAD_REQUEST;
	}
}

export default BadRequestError;
