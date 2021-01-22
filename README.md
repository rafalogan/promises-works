# promises-works
Exemple based on live of Erick Wendel Channel

[Live #4 - O que você não sabia sobre Promises em Javascript - Pré #SemanaJSExpert](https://www.youtube.com/watch?v=40kiPpRoH0A)

This project simulates how to axios works with the objective to study the js Promises.

### Requires

Nodejs V15.6.0 or later.

### Command's

run this command's in or terminal:

* ``npm start`` to run the project in production;
* ``npm run dev`` to run the project in development;

> to tests suite run:
> * ``npm test`` or ``npm t`` to test the application;
> * `` npm run test:dev`` to test in run time;
> * `` npm run test:cov`` to test the coverage of application;

```npm
"scripts": {
    "start": "node src/",
    "dev": "npx nodemon src/",
    "test:dev": "npx mocha -w test/**",
    "test": "npx mocha --parallel --exit test/**",
    "test:cov": "npx nyc --check-coverage --instrument npm t"
  },
```
### Notes 

In the file ``request.test.js`` in test:

```javascript
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
```
can replace ``.callsFake(...)`` to ``.resolve(...)`` how to example:
```javascript
it('should return ok when promise time is ok', async () => {
		const expected = { ok: 'ok'};
		sandbox.stub(request, request.get.name)
			.resolves(expected);

		const call = () => request.makeRequest({url: 'https://testing.com', method: 'get', timeout});

		await assert.doesNotReject(call());
		assert.deepStrictEqual(await call(), expected);
	});
```
