const ErrorHandler = require('./app/handlers/errorHandler');
const Request = require('./app/request');

const PERIOD = 2000

const errorHandler = new ErrorHandler();
const request = new Request({errorHandler});
const urls = [
	{ url: 'https://www.mercadobitcoin.net/api/BTC/ticker/'},
	{ url: 'https://www.naoexiste.net'},
	{ url: 'https://www.mercadobitcoin.net/api/BTC/orderbook/'},
	{ url: 'https://www.mercadobitcoin.net/api/BTC/trades/?id=3706'},
]

const scheduler = async () => {
	const allSucceeded = [];
	const allFailed = [];

	console.log('Starting in', new Date().toISOString());
	const requests =  urls.map(data => ({...data, timeout: 2000, method: 'get'}))
		.map(params => request.makeRequest(params))

	const result = await Promise.allSettled(requests);

	for (const {status, value, reason} of result) {
		if (status === 'reject') {
			allFailed.push(reason);
			continue;
		}
		allSucceeded.push(value);
	}

	console.log({allFailed, allSucceeded});
}

setInterval(scheduler, PERIOD);

