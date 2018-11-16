import { __PRIVATES__, setCheckIfIsInitialisedFunction, pushTransitionAllowedCheckFunction, isTransitionAllowed } from '../../router/router.transition-middleware';

describe('router.transition-middleware', () => {

  let isInitialisedReturn = false;
  let isInitialisedFunction;

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
    isInitialisedReturn = false;
    isInitialisedFunction = jestFn(() => {
      return isInitialisedReturn;
    });
    setCheckIfIsInitialisedFunction(isInitialisedFunction);
  });

  afterEach(() => {
    __PRIVATES__.reset();
  });


  test('intial is initialised returns false', () => {
    expect(__PRIVATES__.getIsInitialisedFunction()()).toEqual(false);
  });

  test('if not initialised will allways block without even calling transition allowed functions', (done) => {

    const transitionAllowedCheckFunction = jestFn(function() {
      return true;
    });
    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);

    isTransitionAllowed()
    .then((res) => {
      expect(res).toEqual(false);
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('if not initialised will allways block without even calling transition allowed functions even if the allowed function in async', (done) => {

    const transitionAllowedCheckFunction = jestFn(function() {
      return new Promise(() => {});
    });
    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);

    isTransitionAllowed()
    .then((res) => {
      expect(res).toEqual(false);
      done();
    })
    .catch(() => {
      fail(err);
      done();
    });
  });

  test('will block transition if previous check havent returned yet', (done) => {

    isInitialisedReturn = true;
    const transitionAllowedCheckFunction = jestFn(function() {
      return new Promise(() => {});
    });
    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);

    expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(0);

    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(false);

    isTransitionAllowed();  // will never finish

    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);

    expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(1);

    isTransitionAllowed()
    .then((res) => {
      expect(res).toEqual(false);
      expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);
      expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(1);
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

  test('allow transition is async and by default pops the function once transition is allowed', (done) => {

    isInitialisedReturn = true;

    let transitionAllowedCheckResolve;
    let transitionAllowedCheckReturn = new Promise((resolve) => {
      transitionAllowedCheckResolve = resolve;
    });
    const transitionAllowedCheckFunction = jestFn(function() {
      return transitionAllowedCheckReturn;
    });
    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);

    expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(1);

    expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(0);

    let transitionAllowed = false;
    isTransitionAllowed()
    .then(() => {
      expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(false);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);
      transitionAllowed = true;
      return isTransitionAllowed()
      .then(() => done());  // next check passed
    })
    .catch((err) => {
      fail(err);
      done();
    });
    
    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);
    
    setTimeout(() => {
      expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(1);
      expect(transitionAllowed).toEqual(false);
      transitionAllowedCheckResolve();
    }, 10);
    
  });

  test('pushTransitionAllowedCheckFunction not function sent will console.error', (done) => {

    isInitialisedReturn = true;

    const oldConsoleError = console.error;
    console.error = jestFn();

    const popFunc = pushTransitionAllowedCheckFunction(1);
    expect(popFunc === undefined).toEqual(true);
    expect(console.error.mock.calls.length).toEqual(1);
    expect(console.error.mock.calls[0]).toEqual(['pushTransitionAllowedCheckFunction attempting to push a transitionAllowedCheckFunction of type number (1)']);

    console.error = oldConsoleError;

    done();
        
  });

  test('pushTransitionAllowedCheckFunction returns a function which when called removes the function', (done) => {

    isInitialisedReturn = true;

    let transitionAllowedCheckResolve;
    let transitionAllowedCheckReturn = new Promise((resolve) => {
      transitionAllowedCheckResolve = resolve;
    });
    const transitionAllowedCheckFunction = jestFn(function() {
      return transitionAllowedCheckReturn;
    });

    expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);

    const popFunc = pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);

    expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(1);

    popFunc();

    expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);

    done();
        
  });

  test('pushTransitionAllowedCheckFunction popOncePasses works as expected (internal test)', (done) => {

    isInitialisedReturn = true;

    let transitionAllowedCheckResolve;
    let transitionAllowedCheckReturn = new Promise((resolve) => {
      transitionAllowedCheckResolve = resolve;
    });
    const transitionAllowedCheckFunction = jestFn(function() {
      return transitionAllowedCheckReturn;
    });

    expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);

    let popFunc = pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);

    expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(1);
    expect(__PRIVATES__.routerTransitionAllowedCheckFunctions[0]).not.toEqual(transitionAllowedCheckFunction);
    expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(0);

    let allowed = false;
    __PRIVATES__.routerTransitionAllowedCheckFunctions[0]()
    .then(() => {
      allowed = true;
      expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(1);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);

      popFunc = pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction, false);

      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(1);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions[0]).toEqual(transitionAllowedCheckFunction);
  
      popFunc();
  
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);
  
      done();

    })
    .catch((err) => {
      fail(err);
      done();
    });

    setTimeout(() => {
      expect(allowed).toEqual(false);
      transitionAllowedCheckResolve();
    }, 10);
        
  });

  test('pushTransitionAllowedCheckFunction popOncePasses works as expected (exernal test)', (done) => {

    isInitialisedReturn = true;

    const transitionAllowedCheckFunction = jestFn(function() {
      return true;
    });

    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);

    expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(0);

    isTransitionAllowed()
    .then((res) => {
      expect(res).toEqual(true);
      expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(1);
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(1);
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction, false);
      expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(1);
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(2);
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(3);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(1);
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

  test('isTransitionAllowed works as expected', (done) => {

    isInitialisedReturn = true;

    let transitionAllowedCheckReturn;
    const transitionAllowedCheckFunction = jestFn(function() {
      return transitionAllowedCheckReturn;
    });

    transitionAllowedCheckReturn = undefined;
    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
    isTransitionAllowed()
    .then((res) => {
      expect(res).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);
      transitionAllowedCheckReturn = null;
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);
      transitionAllowedCheckReturn = true;
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);
      transitionAllowedCheckReturn = Promise.resolve();
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);
      transitionAllowedCheckReturn = Promise.resolve(true);
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(0);
      transitionAllowedCheckReturn = Promise.resolve(false);
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(false);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(1);
      transitionAllowedCheckReturn = false;
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(false);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(1);
      transitionAllowedCheckReturn = Promise.reject();
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(false);
      expect(__PRIVATES__.routerTransitionAllowedCheckFunctions.length).toEqual(1);
    })
    .then(() => {
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

  test('isTransitionAllowed only calls last pushed function', (done) => {

    isInitialisedReturn = true;

    __PRIVATES__.routerTransitionAllowedCheckFunctions.splice(0, __PRIVATES__.routerTransitionAllowedCheckFunctions.length);
    const fn1 = jestFn(() => false);
    const fn2 = jestFn(() => true);
    const fn3 = jestFn(() => true);
    pushTransitionAllowedCheckFunction(fn1);
    pushTransitionAllowedCheckFunction(fn2);
    pushTransitionAllowedCheckFunction(fn3);

    isTransitionAllowed()
    .then((res) => {
      expect(res).toEqual(true);
      expect(fn3.mock.calls.length).toEqual(1);
      expect(fn2.mock.calls.length).toEqual(0);
      expect(fn1.mock.calls.length).toEqual(0);
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

});
