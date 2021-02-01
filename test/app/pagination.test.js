const https = require('https');
const assert = require('assert');

const {describe, it, before, afterEach} = require('mocha');
const {createSandbox} = require('sinon');

const Pagination = require("../../src/app/pagination");
const mockResponse = require('../mock/mockResponse.json');

const url =

describe('#Pagination tests', () => {
	let sandbox;
	let pagination;

	before(() => {
		sandbox = createSandbox();
		pagination = new Pagination();
	});

	afterEach(() => sandbox.restore());

	describe('#Pagination', () => {

		it('#sleep, should be a Promise object and not return values', async () => {
				const clock = sandbox.useFakeTimers()
				const time = 1;
				const pendingPromise = Pagination.sleep(time);

				clock.tick(time);

				assert.ok(pendingPromise instanceof Promise);

				const result = await pendingPromise;

				assert.ok(result === undefined);
		});

		describe('#handleRequest', () => {
			it('should retry an request twice before throing an exception and validate requet params and flow', async () => {
				const expectedCallCount = 2;
				const expectedTimeout = 10;


				pagination.maxRetries = expectedCallCount;
				pagination.retryTimeout = expectedTimeout;
				pagination.maxRequestTimeout = expectedTimeout;

				const error = new Error('timeout');
				sandbox.spy(pagination, pagination.handleRequest.name);
				sandbox.stub(
					Pagination,
					Pagination.sleep.name
				).resolves()

				sandbox.stub(
					pagination.request,
					pagination.request.makeRequest.name
				).rejects(error);

				const dataRequest = {url: 'https://google.com', page: 0};

				await assert.rejects(pagination.handleRequest(dataRequest), error);
				assert.deepStrictEqual(pagination.handleRequest.callCount, expectedCallCount);

				const lastCall = 1
				const firstCallArg = pagination.handleRequest.getCall(lastCall).firstArg;
				const firstCallRetries = firstCallArg.retries;
				assert.deepStrictEqual(firstCallRetries, expectedCallCount);

				const expectedArgs = {
					url: `${dataRequest.url}?tid=${dataRequest.page}`,
					method: 'get',
					timeout: expectedTimeout
				};

				const firstCallArgs = pagination.request.makeRequest.getCall(0).args;
				assert.deepStrictEqual(firstCallArgs, [expectedArgs]);
				assert.ok(Pagination.sleep.calledWithExactly(expectedTimeout));

			});

			it('should return data from request when succeeded', async () => {
				const expected = {result: 'ok'};
				sandbox.stub(
					pagination.request,
					pagination.request.makeRequest.name,
				).resolves(expected);

				const result = await pagination.handleRequest({url: 'https://google.com', page: 1});
				assert.deepStrictEqual(result, expected)
			});
		});

		describe('#getPaginated', () => {
			it('should update request id on each request', async () => {
				sandbox.stub(
					Pagination,
					Pagination.sleep.name
				).resolves()

				sandbox.stub(
					pagination,
					pagination.handleRequest.name)
					.onCall(0).resolves([mockResponse[0]])
					.onCall(1).resolves([mockResponse[1]])
					.onCall(2).resolves([]);

				sandbox.spy(pagination, pagination.getPaginated.name);

				const data = {url: 'https://testgetpaginated.com', page: 1};
				const secondCallExpectation = {
					... data,
					page: mockResponse[0].tid
				};

				const thirdCallExpectation = {
					...secondCallExpectation,
					page: mockResponse[1].tid
				}

				/*
				* to call a function that is a generator
				* Array.from(pagination.getPaginated()) => that way he doesn't expect demand data!
				* he save all in memory and after push in array
				*
				* const r = pagination.getPaginated()
				* r.next() => {done: true | false, value: {}}
				* the best form is user the [for of]
				* */
				const gen = pagination.getPaginated(data);

				for await (const result of gen) {

				}


				const getFirstArgFromCall = value => pagination.handleRequest.getCall(value).firstArg;
				assert.deepStrictEqual(getFirstArgFromCall(0), data);
				assert.deepStrictEqual(getFirstArgFromCall(1), secondCallExpectation);
				assert.deepStrictEqual(getFirstArgFromCall(3), thirdCallExpectation);
			});
			it('should stop requesting when request return an empty array');
		});

	});
});
