import { promisifyFunctionCall } from '../../router/router.util'

describe('router index', () => {

  const jestFn = (fn) => {
    if(!fn) {
      return jest.fn();
    }
    const ret = jest.fn(function() {
      const args = Array.prototype.slice.call(arguments);
      const fnRet = fn.apply(this, args);
      ret.mock.results.push({ value: fnRet, context: this });
      return fnRet;
    });
    ret.mock.results = [];
    return ret;
  };

  beforeEach(() => {
  });

  afterEach(() => {
  });

  test('if fn throws an error promisifyFunctionCall will return a rejected promise', (done) => {

    let innerFn;
    const fn = jestFn(() => {
      return innerFn();
    });

    promisifyFunctionCall(fn)
    .then(() => {
      fail('should return a rejected promise');
      done();
    })
    .catch((err) => {
      expect(err).toBeTruthy();
      done();
    });
    
  });

  test('returns a promise with the resolve value equal to the return value', (done) => {

    let innerFn;
    const fn = jestFn(function() {
      return innerFn();
    });

    innerFn = function() {
      return '123';
    };
    const context = { mama: 'jabet baby' };
    promisifyFunctionCall(fn, [1, 2, 3], context)
    .then((res) => {
      expect(fn.mock.calls.length).toEqual(1);
      expect(fn.mock.calls[0]).toEqual([1, 2, 3]);
      expect(fn.mock.results[0].context).toEqual(context);
      expect(fn.mock.results[0].value).toEqual('123');
      expect(res).toEqual('123');
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
    
  });

  test('is async', (done) => {

    let innerResolve;
    let innerReturn = new Promise((resolve) => {
      innerResolve = resolve;
    });
    const fn = jestFn(function() {
      return innerReturn;
    });

    let resolved = false;
    promisifyFunctionCall(fn)
    .then((res) => {
      resolved = true;
      expect(fn.mock.calls.length).toEqual(1);
      expect(res).toEqual('123');
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
    expect(fn.mock.calls.length).toEqual(1);
    
    setTimeout(() => {
      expect(resolved).toEqual(false);
      innerResolve('123');
    }, 10);
  });
});
