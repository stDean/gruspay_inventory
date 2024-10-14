// In-memory store to track request counts
const rateLimiters = {};

// Rate limiter middleware function
export function customRateLimiter(windowMs, maxRequests, errMsg) {
	return (req, res, next) => {
		const currentTime = Date.now();
		const uniqueKey = `${req.ip}:${req.path}`; // Use IP and path as the identifier for simplicity

		// Initialize user request data if not present
		if (!rateLimiters[uniqueKey]) {
			rateLimiters[uniqueKey] = { count: 1, startTime: currentTime };
		} else {
			const userData = rateLimiters[uniqueKey];

			// If the window has passed, reset the user's data
			if (currentTime - userData.startTime > windowMs) {
				rateLimiters[uniqueKey] = { count: 1, startTime: currentTime };
			} else {
				// Increment request count
				userData.count++;

				// If request count exceeds the max allowed, block the request
				if (userData.count > maxRequests) {
					return res.status(429).json({
						msg: errMsg || "Too many requests. Please try again later.",
					});
				}
			}
		}

		console.log({ rateLimiters });
		// Allow the request to proceed
		next();
	};
}
