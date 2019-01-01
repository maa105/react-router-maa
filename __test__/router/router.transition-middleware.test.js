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
    expect(__PRIVATES__.getIsInitialisedFunction()()).toEqual(false);
    setCheckIfIsInitialisedFunction(isInitialisedFunction);
  });

  afterEach(() => {
    __PRIVATES__.reset();
    expect(__PRIVATES__.getIsInitialisedFunction()()).toEqual(false);
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
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('pushing keeps functions ordered according to priority', (done) => {

    const fn1 = jestFn(function() {});
    const fn2 = jestFn(function() {});
    const fn3 = jestFn(function() {});
    const fn4 = jestFn(function() {});
    const fn5 = jestFn(function() {});

    pushTransitionAllowedCheckFunction(fn1, true, 4);
    pushTransitionAllowedCheckFunction(fn2, true, 4);
    pushTransitionAllowedCheckFunction(fn3, true, 0);
    pushTransitionAllowedCheckFunction(fn4, true, 0);
    pushTransitionAllowedCheckFunction(fn5, true, 2);

    expect(__PRIVATES__.routerTransitionAllowedChecks).toEqual([
      { checkFunc: fn3, popOnceRouteAllowed: true, priority: 0, popCheckFunc: undefined },
      { checkFunc: fn4, popOnceRouteAllowed: true, priority: 0, popCheckFunc: undefined },
      { checkFunc: fn5, popOnceRouteAllowed: true, priority: 2, popCheckFunc: undefined },
      { checkFunc: fn1, popOnceRouteAllowed: true, priority: 4, popCheckFunc: undefined },
      { checkFunc: fn2, popOnceRouteAllowed: true, priority: 4, popCheckFunc: undefined }
    ]);

    done();
  });

  test('popMe function is added to whatever is sent to isTransitionAllowed function, and if called the function is poped regardless of whether the route passed or not', (done) => {

    isInitialisedReturn = true;
    const transitionAllowedCheckFunction = jestFn(function(e) {
      expect(typeof(e.popMe)).toEqual('function');
      expect(e).toEqual({ hello: 'world', popMe: e.popMe });
      e.popMe();
      return false;
    });
    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction, false);

    const e = { hello: 'world' };
    isTransitionAllowed(e)
    .then((res) => {
      expect(e).toEqual({ hello: 'world' });
      expect(res).toEqual(false);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('popCheck function is called only when route is allowed', (done) => {

    isInitialisedReturn = true;

    let transitionAllowedCheckFunctionReturn = false;
    const transitionAllowedCheckFunction = jestFn(function() {
      return transitionAllowedCheckFunctionReturn;
    });
    let popCheckFunctionReturn = false;
    const popCheckFunction = jestFn(function() {
      return popCheckFunctionReturn;
    });
    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction, false, 0, popCheckFunction);

    const e = { hello: 'world' };
    isTransitionAllowed(e)
    .then((res) => {
      expect(res).toEqual(false);
      expect(popCheckFunction.mock.calls.length).toEqual(0);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);
      transitionAllowedCheckFunctionReturn = true;
      return isTransitionAllowed(e);
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(popCheckFunction.mock.calls.length).toEqual(1);
      expect(popCheckFunction.mock.calls[0]).toEqual([{ hello: 'world' }]);
      expect(popCheckFunction.mock.calls[0][0] === e).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);
      popCheckFunctionReturn = true;
      return isTransitionAllowed(e);
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(popCheckFunction.mock.calls.length).toEqual(2);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('if popOnceRouteAllowed is enabled popCheck function is useless', (done) => {

    isInitialisedReturn = true;

    const transitionAllowedCheckFunction = jestFn(function() {
      return true;
    });
    const popCheckFunction = jestFn(function() {
      return false;
    });
    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction, true, 0, popCheckFunction);

    isTransitionAllowed()
    .then((res) => {
      expect(res).toEqual(true);
      expect(popCheckFunction.mock.calls.length).toEqual(0);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);
      done();
    })
    .catch((err) => {
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

  test('pushing transition allowed check function while transition is being checked will delay the pushing till the currently running check is over', (done) => {

    isInitialisedReturn = true;

    let resolveFunction;
    const transitionAllowedCheckFunction = jestFn(function() {
      return new Promise((resolve) => {
        resolveFunction = resolve;
      });
    });
    expect(__PRIVATES__.getRouterTransitionAllowedChecks().length).toEqual(0);
    expect(__PRIVATES__.getRouterTransitionAllowedChecksPushFunctionsStack().length).toEqual(0);
    pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
    expect(__PRIVATES__.getRouterTransitionAllowedChecks().length).toEqual(1);
    expect(__PRIVATES__.getRouterTransitionAllowedChecks()[0].checkFunc).toEqual(transitionAllowedCheckFunction);
    expect(__PRIVATES__.getRouterTransitionAllowedChecksPushFunctionsStack().length).toEqual(0);

    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(false);
    const promise = isTransitionAllowed();
    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);

    const transitionAllowedCheckFunction2 = () => true;
    expect(__PRIVATES__.getRouterTransitionAllowedChecks().length).toEqual(1);
    expect(__PRIVATES__.getRouterTransitionAllowedChecksPushFunctionsStack().length).toEqual(0);
    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);
    const pop2 = pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction2);
    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);
    expect(__PRIVATES__.getRouterTransitionAllowedChecks().length).toEqual(1);
    expect(__PRIVATES__.getRouterTransitionAllowedChecks()[0].checkFunc).toEqual(transitionAllowedCheckFunction);
    expect(__PRIVATES__.getRouterTransitionAllowedChecksPushFunctionsStack().length).toEqual(1);

    const transitionAllowedCheckFunction3 = () => true;
    expect(__PRIVATES__.getRouterTransitionAllowedChecks().length).toEqual(1);
    expect(__PRIVATES__.getRouterTransitionAllowedChecksPushFunctionsStack().length).toEqual(1);
    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);
    const pop3 = pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction3);
    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);
    expect(__PRIVATES__.getRouterTransitionAllowedChecks().length).toEqual(1);
    expect(__PRIVATES__.getRouterTransitionAllowedChecks()[0].checkFunc).toEqual(transitionAllowedCheckFunction);
    expect(__PRIVATES__.getRouterTransitionAllowedChecksPushFunctionsStack().length).toEqual(2);

    pop2();

    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);
    expect(__PRIVATES__.getRouterTransitionAllowedChecks().length).toEqual(1);
    expect(__PRIVATES__.getRouterTransitionAllowedChecks()[0].checkFunc).toEqual(transitionAllowedCheckFunction);
    expect(__PRIVATES__.getRouterTransitionAllowedChecksPushFunctionsStack().length).toEqual(1);

    expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(true);
    resolveFunction(true);

    promise
    .then((res) => {
      expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(false);
      expect(res).toEqual(true);
      expect(__PRIVATES__.getRouterTransitionAllowedChecks().length).toEqual(1);  // 1 poped since route allowed and replaced by one from routerTransitionAllowedChecksPushFunctionsStack
      expect(__PRIVATES__.getRouterTransitionAllowedChecksPushFunctionsStack().length).toEqual(0);
      expect(__PRIVATES__.getRouterTransitionAllowedChecks()[0].checkFunc).toEqual(transitionAllowedCheckFunction3);
      
      pop3();
      expect(__PRIVATES__.getRouterTransitionAllowedChecks().length).toEqual(0);

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

    expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);

    expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(0);

    let transitionAllowed = false;
    isTransitionAllowed()
    .then(() => {
      expect(__PRIVATES__.getIsCheckingIfTransitionIsAllowed()).toEqual(false);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);
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
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);
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

    expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);

    const popFunc = pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);

    expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);

    popFunc();

    expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);

    done();
        
  });

  test('pushTransitionAllowedCheckFunction popOnceRouteAllowed works as expected (internal test)', (done) => {

    isInitialisedReturn = true;

    let transitionAllowedCheckResolve;
    let transitionAllowedCheckReturn = new Promise((resolve) => {
      transitionAllowedCheckResolve = resolve;
    });
    const transitionAllowedCheckFunction = jestFn(function() {
      return transitionAllowedCheckReturn;
    });

    expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);

    let popFunc = pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);

    expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);
    expect(__PRIVATES__.routerTransitionAllowedChecks[0]).toEqual({ checkFunc: transitionAllowedCheckFunction, popOnceRouteAllowed: true, priority: 0, popCheckFunc: undefined });
    expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(0);

    let allowed = false;
    __PRIVATES__.routerTransitionAllowedChecks[0].checkFunc()
    .then(() => {
      allowed = true;
      expect(transitionAllowedCheckFunction.mock.calls.length).toEqual(1);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);

      popFunc = pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction, false);

      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(2);
      expect(__PRIVATES__.routerTransitionAllowedChecks[1]).toEqual({ checkFunc: transitionAllowedCheckFunction, popOnceRouteAllowed: false, priority: 0, popCheckFunc: undefined });
  
      popFunc();
  
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);
  
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

  test('pushTransitionAllowedCheckFunction popOnceRouteAllowed works as expected (exernal test)', (done) => {

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
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);
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
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);
      transitionAllowedCheckReturn = null;
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);
      transitionAllowedCheckReturn = true;
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);
      transitionAllowedCheckReturn = Promise.resolve();
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);
      transitionAllowedCheckReturn = Promise.resolve(true);
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(0);
      transitionAllowedCheckReturn = Promise.resolve(false);
      pushTransitionAllowedCheckFunction(transitionAllowedCheckFunction);
      return isTransitionAllowed()
    })
    .then((res) => {
      expect(res).toEqual(false);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);
      transitionAllowedCheckReturn = false;
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(false);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);
      transitionAllowedCheckReturn = Promise.reject();
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(false);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(1);
    })
    .then(() => {
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

  test('isTransitionAllowed stops when either true or false is returned and passes if no one returnes anything', (done) => {

    isInitialisedReturn = true;

    __PRIVATES__.routerTransitionAllowedChecks.splice(0, __PRIVATES__.routerTransitionAllowedChecks.length);
    let ret1 = false;
    let ret2 = true;
    let ret3 = true;
    const fn1 = jestFn(() => ret1);
    const fn2 = jestFn(() => ret2);
    const fn3 = jestFn(() => ret3);
    pushTransitionAllowedCheckFunction(fn1, false);
    pushTransitionAllowedCheckFunction(fn2, false);
    pushTransitionAllowedCheckFunction(fn3, false);

    isTransitionAllowed()
    .then((res) => {
      expect(res).toEqual(true);
      expect(fn3.mock.calls.length).toEqual(1);
      expect(fn2.mock.calls.length).toEqual(0);
      expect(fn1.mock.calls.length).toEqual(0);
      expect(__PRIVATES__.routerTransitionAllowedChecks.length).toEqual(3);

      ret3 = undefined;
      ret2 = false;
      ret1 = true;
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(false);
      expect(fn3.mock.calls.length).toEqual(2);
      expect(fn2.mock.calls.length).toEqual(1);
      expect(fn1.mock.calls.length).toEqual(0);

      ret3 = undefined;
      ret2 = undefined;
      ret1 = true;
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(fn3.mock.calls.length).toEqual(3);
      expect(fn2.mock.calls.length).toEqual(2);
      expect(fn1.mock.calls.length).toEqual(1);

      ret3 = undefined;
      ret2 = undefined;
      ret1 = undefined;
      return isTransitionAllowed();
    })
    .then((res) => {
      expect(res).toEqual(true);
      expect(fn3.mock.calls.length).toEqual(4);
      expect(fn2.mock.calls.length).toEqual(3);
      expect(fn1.mock.calls.length).toEqual(2);
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

});
