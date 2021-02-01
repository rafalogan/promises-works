
class ErrorHandler {
	errorTimeout = (rejects, urlRequest) => () => rejects(new Error(`timeout at [${urlRequest}] :(`))
}


module.exports = ErrorHandler;
