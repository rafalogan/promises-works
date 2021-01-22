const https = require('https');

class Request {

	constructor({errorHandler}) {
		this.errorHandler = errorHandler;
	}

	async get(url) {
		return new Promise((resolve, reject) =>{
			https.get(url, res => {
				const items = [];
				res.on('data', data => items.push(data))
					.on('end', () => resolve(JSON.parse(items.join(''))));
			}).on('error', reject);
		})
	}

	async makeRequest({url, method, timeout}) {
		return Promise.race([
			this[method](url),
			this.raceTimoutDelay(url, timeout)
		])
	}

	raceTimoutDelay(url, timeout) {
		return new Promise(((resolve, reject) => {
			setTimeout(this.errorHandler.errorTimeout(reject, url), timeout);

		}));
	}
}

module.exports = Request;
