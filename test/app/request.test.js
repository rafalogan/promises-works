const assert = require('assert');
const https = require('https');
const Events = require('events');

const {describe, it, before, afterEach} = require('mocha');
const {createSandbox} = require('sinon');

const Request = require('../../src/app/request');
const ErrorHandler = require("../../src/app/errorHandler");

describe('#test', () => {
	const timeout = 15;
	let sandbox;
	let request;
	let errorHandler;

	before(() => {
		sandbox = createSandbox();
		errorHandler = new ErrorHandler();
		request = new Request({errorHandler});
	});

	afterEach(() => sandbox.restore());

	it(`should throw a timeout erro when the function has sepent more than ${timeout}ms`, async () => {
		const excededTimeout = timeout + 10;
		sandbox.stub(request, request.get.name)
			.callsFake(() => new Promise(resolve => setTimeout(resolve, excededTimeout)));

		const call = request.makeRequest({url: 'https://testing.com', method: 'get', timeout});

		await assert.rejects(call, {message: 'timeout at [https://testing.com] :('})

	});

	it('should return ok when promise time is ok', async () => {
		const expected = { ok: 'ok'};
		sandbox.stub(request, request.get.name)
			.callsFake( async () => {
				await new Promise(resolve => setTimeout(resolve));
				return expected;
			});

		const call = () => request.makeRequest({url: 'https://testing.com', method: 'get', timeout});

		await assert.doesNotReject(call());
		assert.deepStrictEqual(await call(), expected);
	});

	it('should return a JSON object after a request', async () => {
		const data = [
			Buffer.from('{'),
			Buffer.from('"ok": '),
			Buffer.from('"ok"'),
			Buffer.from('}'),
		];

		const responseEvent = new Events()
		const httpsEvent = new Events();

		sandbox.stub(https, https.get.name)
			.yields(responseEvent)
			.returns(httpsEvent);

		const expected = { ok: 'ok'};
		const pendingPromise = request.get('https://testing.com');

		data.forEach(item => responseEvent.emit('data', item));
		responseEvent.emit('end');

		const result = await pendingPromise;

		assert.deepStrictEqual(result, expected);
	});

});
