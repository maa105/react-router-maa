import { promisifyFunctionCall, sortedInsert, ensurePathName, ensureSlashPrefix, trimSlashSuffix } from '../../router/router.util'

describe('router index', () => {

  const jestFn = (fn) => {
    if(!fn) {
      return jest.fn();
    }
    const ret = jest.fn(function() {
      const args = Array.prototype.slice.call(arguments);
      const fnRet = fn.apply(this, args);
      ret.mock.results[ret.mock.results.length - 1].context = this;
      return fnRet;
    });
    return ret;
  };

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('promisifyFunctionCall', () => {
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

  describe('sortedInsert', () => {
    test('inserts ordered', (done) => {

      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ v: n }));

      const compFunction = (a, b) => {
        return a.v - b.v;
      };

      sortedInsert(arr, { v: 10 }, compFunction);
      sortedInsert(arr, { v: 10, c: 0 }, compFunction);
      sortedInsert(arr, { v: 10, c: 1 }, compFunction);
      sortedInsert(arr, { v: 1000 }, compFunction);
      sortedInsert(arr, { v: 0 }, compFunction);
      sortedInsert(arr, { v: 0, c: 0 }, compFunction);
      sortedInsert(arr, { v: -1000 }, compFunction);
      sortedInsert(arr, { v: 5, c: 0 }, compFunction);
      sortedInsert(arr, { v: 5, c: 1 }, compFunction);
      sortedInsert(arr, { v: 5, c: 2 }, compFunction);
      sortedInsert(arr, { v: 5.000001 }, compFunction);
      sortedInsert(arr, { v: 4.999999 }, compFunction);
      
      expect(arr).toEqual([
        { v: -1000 },
        { v: 0 },
        { v: 0, c: 0 },
        { v: 1 },
        { v: 2 },
        { v: 3 },
        { v: 4 },
        { v: 4.999999 },
        { v: 5 },
        { v: 5, c: 0 },
        { v: 5, c: 1 },
        { v: 5, c: 2 },
        { v: 5.000001 },
        { v: 6 },
        { v: 7 },
        { v: 8 },
        { v: 9 },
        { v: 10 },
        { v: 10, c: 0 },
        { v: 10, c: 1 },
        { v: 1000 }
      ]);

      done();
      
    });
  });

  describe('ensurePathName', () => {
    test('falsey returns /', (done) => {

      expect(ensurePathName()).toEqual('/');
      expect(ensurePathName(undefined)).toEqual('/');
      expect(ensurePathName(null)).toEqual('/');
      expect(ensurePathName(false)).toEqual('/');
      expect(ensurePathName('')).toEqual('/');
      expect(ensurePathName(NaN)).toEqual('/');

      done();
    });
    test('truthy returns self', (done) => {

      const t = { t: 1 };
      expect(ensurePathName('/test')).toEqual('/test');
      expect(ensurePathName(t) === t).toEqual(true);

      done();
    });
  });

  describe('ensureSlashPrefix', () => {
    test('falsey returns /', (done) => {

      expect(ensureSlashPrefix()).toEqual('/');
      expect(ensureSlashPrefix(undefined)).toEqual('/');
      expect(ensureSlashPrefix(null)).toEqual('/');
      expect(ensureSlashPrefix(false)).toEqual('/');
      expect(ensureSlashPrefix('')).toEqual('/');
      expect(ensureSlashPrefix(NaN)).toEqual('/');

      done();
    });
    test('if first char is not / it gets added', (done) => {

      expect(ensureSlashPrefix('123')).toEqual('/123');

      done();
    });
    test('if first char is / it returns as is', (done) => {

      expect(ensureSlashPrefix('/123')).toEqual('/123');

      done();
    });
  });

  describe('trimSlashSuffix', () => {
    test('falsey returns empty string', (done) => {

      expect(trimSlashSuffix()).toEqual('');
      expect(trimSlashSuffix(undefined)).toEqual('');
      expect(trimSlashSuffix(null)).toEqual('');
      expect(trimSlashSuffix(false)).toEqual('');
      expect(trimSlashSuffix('')).toEqual('');
      expect(trimSlashSuffix(NaN)).toEqual('');

      done();
    });
    test('if last char is not / it returns as is', (done) => {

      expect(trimSlashSuffix('123')).toEqual('123');

      done();
    });
    test('if last char is / it trims it', (done) => {

      expect(trimSlashSuffix('123/')).toEqual('123');

      done();
    });
  });

});
