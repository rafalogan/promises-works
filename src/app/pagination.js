
const ErrorHandler = require('./handlers/errorHandler');
const Request = require('./request');

const errorHandler = new ErrorHandler();

const DEFAULT_OPTIONS = {
	maxRetries: 4,
	retryTimeout: 1000,
	maxRequestTimeout: 1000,
	threshold: 500
}


class Pagination {
	constructor(options = DEFAULT_OPTIONS) {
		this.request = new Request({errorHandler});

		this.maxRetries = options.maxRetries;
		this.retryTimeout = options.retryTimeout;
		this.maxRequestTimeout = options.maxRequestTimeout;
		this.threshold = options.threshold;
	}

	async handleRequest({url, page, retries = 1}) {
		try {
			const finalUrl = `${url}?tid=${page}`
			const result = await this.request.makeRequest({
				url: finalUrl,
				method: 'get',
				timeout: this.maxRequestTimeout
			})

			return result

		} catch (error) {
			if (retries === this.maxRetries) {
				console.error(`[${retries}] max retries reached!`)
				throw error
			}

			console.error(`[${retries}] an error: [${error.message}] has happened! trying again in ${this.retryTimeout}ms`)
			await Pagination.sleep(this.retryTimeout)

			return this.handleRequest({ url, page, retries: retries += 1 })
		}
	}

	async * getPaginated({url, page}) {
		const result = await this.handleRequest({url, page});
		const lastId = result[result.length - 1]?.tid ?? 0;

		//WARNING, more of 1M requests
		if(lastId === 0) return;

		yield result;

		yield * this.getPaginated({url, page: lastId});

	}

	static async sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

module.exports = Pagination;
