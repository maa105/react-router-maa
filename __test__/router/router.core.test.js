import * as historyCreator from 'history';
import { __PRIVATES__, initializeRouter, getRouterState, getRouterStateLocation, getRouterStateLength, pushRouterState, pushRouterStateThroughChange, replaceRouterState, replaceRouterStateThroughChange, goInRouterStates, isInitialised } from '../../router/router.core'

describe('router.core', () => {

  let parseUrl, toUrl;

  let globalSetTimeout, globalClearTimeout;
  
  let globalLocationReload;

  let initKey, initialNoneUrlState, routeChangeHandler, defaultTimeout, baseUrl;
  
  let isTransitionAllowed, transitionAllowedHandler;
  
  let initializationReturn, initializationHandler;

  let mergeFuntion;

  let getUserConfirmationFunction, history, historyReturns;

  let timeoutFunction, blockFunction, listenFunction;

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
    parseUrl = jestFn(function(url) {
      return {
        url: url
      };
    });
    toUrl = jestFn(function(state) {
      return state.url;
    });

    global.window = global;
    globalSetTimeout = global.setTimeout;
    globalClearTimeout = global.clearTimeout;
    global.setTimeout = jestFn(globalSetTimeout);
    global.clearTimeout = jestFn(globalClearTimeout);
    globalLocationReload = global.window.location.reload;
    global.window.location.reload = jestFn();

    __PRIVATES__.reset();

    initKey = '12345';
    initialNoneUrlState = { noneUrl: '123' };
    routeChangeHandler = jestFn();
    defaultTimeout = 1000;
    baseUrl = '';
  
    isTransitionAllowed = true;
    transitionAllowedHandler = jestFn(() => {
      return isTransitionAllowed;
    });
  
    initializationReturn = { test: 11 };
    initializationHandler = jestFn(() => {
      return initializationReturn;
    });
  
    mergeFuntion = jestFn((state, change) => {
      return Object.assign({}, state, change);
    });
  
    historyReturns = {};
  
    jest.spyOn(historyCreator, 'createBrowserHistory').mockImplementation((options) => {
      getUserConfirmationFunction = options.getUserConfirmation;
      expect(typeof(getUserConfirmationFunction)).toEqual('function');
      expect(options).toEqual({ basename: baseUrl, getUserConfirmation: getUserConfirmationFunction });
      return (history = {
        go: jestFn().mockImplementation(() => historyReturns.go),
        push: jestFn().mockImplementation(() => historyReturns.push),
        replace: jestFn().mockImplementation(() => historyReturns.replace),
        block: jestFn().mockImplementation(() => historyReturns.block),
        listen: jestFn().mockImplementation(() => historyReturns.listen),
        location: {
          key: initKey
        }
      });
    });

    jest.spyOn(historyCreator, 'createMemoryHistory').mockImplementation((options) => {
      getUserConfirmationFunction = options.getUserConfirmation;
      expect(typeof(getUserConfirmationFunction)).toEqual('function');
      expect(options).toEqual({ basename: baseUrl, getUserConfirmation: getUserConfirmationFunction });
      return (history = {
        go: jestFn().mockImplementation(() => historyReturns.go),
        push: jestFn().mockImplementation(() => historyReturns.push),
        replace: jestFn().mockImplementation(() => historyReturns.replace),
        block: jestFn().mockImplementation(() => historyReturns.block),
        listen: jestFn().mockImplementation(() => historyReturns.listen),
        location: {
          key: initKey
        }
      });
    });

    jest.spyOn(historyCreator, 'createHashHistory').mockImplementation((options) => {
      getUserConfirmationFunction = options.getUserConfirmation;
      expect(typeof(getUserConfirmationFunction)).toEqual('function');
      expect(options).toEqual({ basename: baseUrl, getUserConfirmation: getUserConfirmationFunction });
      return (history = {
        go: jestFn().mockImplementation(() => historyReturns.go),
        push: jestFn().mockImplementation(() => historyReturns.push),
        replace: jestFn().mockImplementation(() => historyReturns.replace),
        block: jestFn().mockImplementation(() => historyReturns.block),
        listen: jestFn().mockImplementation(() => historyReturns.listen),
        location: {
          key: initKey
        }
      });
    });
  });

  afterEach(() => {
    global.setTimeout = globalSetTimeout;
    global.clearTimeout = globalClearTimeout;
    global.window.location.reload = globalLocationReload;
    delete global.window;
  });

  function initTest() {

    const initPromise = initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'browser', '/').catch((err) => { console.log('ERROR::', err); throw err; });

    expect(historyCreator.createBrowserHistory).toHaveBeenCalled();

    if(initializationHandler && defaultTimeout) {
      expect(setTimeout.mock.calls.length).toEqual(1);
      expect(setTimeout.mock.calls[0].length).toEqual(2);
      expect(typeof(setTimeout.mock.calls[0][0])).toEqual('function');
      expect(setTimeout.mock.calls[0][1]).toEqual(defaultTimeout);
      timeoutFunction = setTimeout.mock.calls[0][0];
      const timeoutReturn = setTimeout.mock.results[0].value;
      globalClearTimeout(timeoutReturn);
    }
    else {
      expect(setTimeout.mock.calls.length).toEqual(0);
      timeoutFunction = undefined;
    }

    expect(history.block.mock.calls.length).toEqual(1);
    expect(history.listen.mock.calls.length).toEqual(1);

    expect(history.block.mock.calls[0].length).toEqual(1);
    expect(history.listen.mock.calls[0].length).toEqual(1);

    expect(typeof(history.block.mock.calls[0][0])).toEqual('function');
    expect(typeof(history.listen.mock.calls[0][0])).toEqual('function');

    blockFunction = history.block.mock.calls[0][0];
    listenFunction = history.listen.mock.calls[0][0];

    expect(initPromise instanceof Promise).toBeTruthy();

    return initPromise;
  }

  test('initializeRouter calls correct create history functions', (done) => {

    baseUrl = '/the/base';

    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'browser', '/');

    expect(historyCreator.createBrowserHistory).toHaveBeenCalled();
    expect(historyCreator.createMemoryHistory).not.toHaveBeenCalled();
    expect(historyCreator.createHashHistory).not.toHaveBeenCalled();
    expect(historyCreator.createBrowserHistory.mock.calls[0][0].basename).toEqual(baseUrl);

    __PRIVATES__.reset();
  
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'memory', '/');

    expect(historyCreator.createBrowserHistory).toHaveBeenCalled();
    expect(historyCreator.createMemoryHistory).toHaveBeenCalled();
    expect(historyCreator.createHashHistory).not.toHaveBeenCalled();
    expect(historyCreator.createMemoryHistory.mock.calls[0][0].basename).toEqual(baseUrl);

    __PRIVATES__.reset();
  
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'hash', '/');

    expect(historyCreator.createBrowserHistory).toHaveBeenCalled();
    expect(historyCreator.createMemoryHistory).toHaveBeenCalled();
    expect(historyCreator.createHashHistory).toHaveBeenCalled();
    expect(historyCreator.createHashHistory.mock.calls[0][0].basename).toEqual(baseUrl);

    done();
  });

  test('initializeRouter\'s initializationFunction is async', (done) => {

    let initializationResolve;
    initializationReturn = new Promise((resolve) => {
      initializationResolve = resolve;
    });
    
    const initPromise = initTest();
    let promiseResolved = false;
    
    globalSetTimeout(() => {
      expect(promiseResolved).toBeFalsy();
      initializationResolve();
    }, 10);

    initPromise.then((state) => {
      promiseResolved = true;
      expect(state).toEqual({ noneUrl: '123', url: '/' });
      expect(parseUrl.mock.calls.length).toEqual(1);
      expect(parseUrl.mock.calls[0][0]).toEqual('/');
      done();
    })
    .catch((err) => {
      promiseResolved = true;
      fail(err);
      done();
    });

  });

  test('initializeRouter with initializationFunction which returns a state', (done) => {

    const initPromise = initTest();
    
    initPromise.then((state) => {
      expect(state).toEqual({ test: 11, noneUrl: '123' });
      expect(parseUrl.mock.calls.length).toEqual(1);
      expect(parseUrl.mock.calls[0][0]).toEqual('/');
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

  test('initializeRouter with initializationFunction which returns a promise that resolves a state', (done) => {

    initializationReturn = Promise.resolve({ foo: 'bar' });
    const initPromise = initTest();
    
    initPromise.then((state) => {
      expect(state).toEqual({ foo: 'bar', noneUrl: '123' });
      expect(parseUrl.mock.calls.length).toEqual(1);
      expect(parseUrl.mock.calls[0][0]).toEqual('/');
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

  test('initializeRouter with initializationFunction which returns a url', (done) => {

    initializationReturn = '/filter';
    const initPromise = initTest();
    
    initPromise.then((state) => {
      expect(state).toEqual({ url: '/filter', noneUrl: '123' });
      expect(parseUrl.mock.calls.length).toEqual(2);
      expect(parseUrl.mock.calls[0][0]).toEqual('/');
      expect(parseUrl.mock.calls[1][0]).toEqual('/filter');
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

  test('initializeRouter with initializationFunction which returns a promise that resolves a url', (done) => {

    initializationReturn = Promise.resolve('/filter');
    const initPromise = initTest();
    
    initPromise.then((state) => {
      expect(state).toEqual({ url: '/filter', noneUrl: '123' });
      expect(parseUrl.mock.calls.length).toEqual(2);
      expect(parseUrl.mock.calls[0][0]).toEqual('/');
      expect(parseUrl.mock.calls[1][0]).toEqual('/filter');
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

  test('initializeRouter with initializationFunction which returns a rejected promise', (done) => {

    initializationReturn = Promise.reject('oops');
    const initPromise = initTest();
    
    initPromise.then(() => {
      fail(err);
      done();
    })
    .catch((err) => {
      expect(err).toEqual('oops');
      expect(getRouterState()).toEqual({ noneUrl: '123', url: '/' });
      expect(parseUrl.mock.calls.length).toEqual(1);
      expect(parseUrl.mock.calls[0][0]).toEqual('/');
      done();
    });

  });

  test('initializeRouter with initializationFunction which times out', (done) => {

    let initializationResolve;
    initializationReturn = new Promise((resolve) => {
      initializationResolve = resolve;
    });
    const initPromise = initTest();

    timeoutFunction();
    initializationResolve({ test: 11 });
    initPromise.then(() => {
      fail(err);
      done();
    })
    .catch((err) => {
      expect(err.message).toEqual('1 seconds passed and the router haven\'t initialised yet');
      expect(getRouterState()).toEqual({ noneUrl: '123', url: '/' });
      expect(parseUrl.mock.calls.length).toEqual(1);
      expect(parseUrl.mock.calls[0][0]).toEqual('/');
      done();
    });

  });

  test('block function saves location and action in blockArgsByKey by generating a key then returns set key', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then((state) => {
      expect(state).toEqual({ url: '/', noneUrl: '123' });
      const key = blockFunction('location', 'action');
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual({ location:'location', action:'action' });
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('getUserConfirmation function takes action and location from blockArgsByKey and clears them and eventually calls isTransitionAllowed function it only blocks transition if isTransitionAllowed returns false or a rejected promise', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then((state) => {
      let key = blockFunction({}, 'PUSH');
      isTransitionAllowed = undefined;
      getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(1);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({}, 'PUSH');
      isTransitionAllowed = true;
      getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(2);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);
      
      key = blockFunction({}, 'PUSH');
      isTransitionAllowed = {};
      getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(3);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({}, 'PUSH');
      isTransitionAllowed = null;
      getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(4);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({}, 'PUSH');
      isTransitionAllowed = false;
      getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(false);
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(5);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({}, 'PUSH');
      isTransitionAllowed = Promise.reject();
      getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(false);
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(6);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({}, 'PUSH');
      isTransitionAllowed = Promise.resolve();
      getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(7);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('getUserConfirmation function is async', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then((state) => {

      const key = blockFunction({}, 'PUSH');
      let isTransitionAllowedResolve;
      isTransitionAllowed = new Promise((resolve) => {
        isTransitionAllowedResolve = resolve;
      });

      let callbackCalled = false;
      getUserConfirmationFunction(key, function callback(allowed) {
        callbackCalled = true;
        expect(allowed).toEqual(true);
        done();
      });
      
      expect(transitionAllowedHandler.mock.calls.length).toEqual(1);

      globalSetTimeout(() => {
        expect(callbackCalled).toEqual(false);
        isTransitionAllowedResolve();
      }, 10);
      
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('getUserConfirmation does not call isTransitionAllowed if noBlockKey is set', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      const key = blockFunction({ state: { [__PRIVATES__.noBlockKey]: true } }, 'PUSH');
      isTransitionAllowed = false;

      getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
        done();
      });
      
      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('getUserConfirmation does call isTransitionAllowed even if noBlockKey is set in case action is POP', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      const key = blockFunction({ state: { [__PRIVATES__.noBlockKey]: true } }, 'POP');
      isTransitionAllowed = false;

      getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(false);
        done();
      });
      
      expect(transitionAllowedHandler.mock.calls.length).toEqual(1);

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('listen function if action is pop goes to the correct state', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(getRouterStateLocation()).toEqual(0);
      expect(getRouterStateLength()).toEqual(4);
      expect(getRouterState()).toEqual({ val: 0 });

      listenFunction({ key:2 }, 'POP');
      
      expect(window.location.reload.mock.calls.length).toEqual(0);
      
      expect(getRouterStateLocation()).toEqual(2);
      expect(getRouterStateLength()).toEqual(4);
      expect(getRouterState()).toEqual({ val: 2 });

      expect(routeChangeHandler.mock.calls.length).toEqual(2);
      expect(routeChangeHandler.mock.calls[1]).toEqual([{ val: 2 }, 2]);

      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('listen function if action is pop and no correct state found will reload the page', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(getRouterStateLocation()).toEqual(0);
      expect(getRouterStateLength()).toEqual(4);
      expect(getRouterState()).toEqual({ val: 0 });

      listenFunction({ key: -1 }, 'POP');
      
      expect(window.location.reload.mock.calls.length).toEqual(1);
      
      expect(getRouterStateLocation()).toEqual(0);
      expect(getRouterStateLength()).toEqual(4);
      expect(getRouterState()).toEqual({ val: 0 });

      expect(routeChangeHandler.mock.calls.length).toEqual(1);

      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('listen function throws an exception if not pop and routerKey is not set', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      try {
        listenFunction({ key: -1 }, 'PUSH');
        fail('listen should throw an error');
      }
      catch(err) {
        expect(err.message).toEqual('Dont use other methods to change route!');
      }
      
      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('listen function should set the key of the current state if not pop and routerKey is set', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      expect(__PRIVATES__.routerStates[0].key).toEqual(initKey);
      
      listenFunction({ key: 'keyyyyy', state: { [__PRIVATES__.routerKey]: true } }, 'PUSH');
      
      expect(__PRIVATES__.routerStates[0].key).toEqual('keyyyyy');

      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('pushRouterState calls isTransitionAllowed is async and pushes the new state once transition is allowed', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      let isTransitionAllowedResolve;
      isTransitionAllowed = new Promise((resolve) => {
        isTransitionAllowedResolve = resolve;
      });

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(getRouterStateLocation()).toEqual(0);
      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
      let transitionAllowed = false;
      pushRouterState({ url: '/test/1' }, { some: 'location state' })
      .then((newState) => {
        transitionAllowed = true;

        expect(toUrl.mock.calls.length).toEqual(1);
        expect(toUrl.mock.calls[0]).toEqual([{ url: '/test/1' }]);

        expect(__PRIVATES__.routerStates).toEqual([
          { key: 0, state: { val: 0 } },
          { state: { url: '/test/1' } }
        ]);
        expect(getRouterStateLocation()).toEqual(1);

        expect(history.push.mock.calls.length).toEqual(1);
        expect(history.push.mock.calls[0]).toEqual(['/test/1', { some: 'location state', [__PRIVATES__.routerKey]: true }]);

        expect(routeChangeHandler.mock.calls.length).toEqual(2);
        expect(routeChangeHandler.mock.calls[1]).toEqual([{ url: '/test/1' }, 1]);

        expect(newState).toEqual({ url: '/test/1' });

        done();
      });
      expect(getRouterStateLocation()).toEqual(0);
      expect(transitionAllowedHandler.mock.calls.length).toEqual(1);

      globalSetTimeout(() => {
        expect(transitionAllowed).toEqual(false);
        expect(__PRIVATES__.routerStates).toEqual([
          { key: 0, state: { val: 0 } },
          { key: 1, state: { val: 1 } },
          { key: 2, state: { val: 2 } },
          { key: 3, state: { val: 3 } }
        ]);
        expect(history.push.mock.calls.length).toEqual(0);
        isTransitionAllowedResolve();
      }, 10);
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('pushRouterState isTransitionAllowed is not called if noBlock is set', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
      pushRouterState({ url: '/test/1' }, { some: 'location state', [__PRIVATES__.noBlockKey]: true })
      .then((newState) => {

        expect(transitionAllowedHandler.mock.calls.length).toEqual(0);

        expect(history.push.mock.calls.length).toEqual(1);
        expect(history.push.mock.calls[0]).toEqual(['/test/1', { some: 'location state', [__PRIVATES__.routerKey]: true, [__PRIVATES__.noBlockKey]: true }]);

        expect(newState).toEqual({ url: '/test/1' });

        done();
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('pushRouterState transition is not allowed if isTransitionAllowed returns false a rejected promise or a promise that resolves exactly to false', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);

      const promises = [];

      isTransitionAllowed = undefined;
      promises.push(
        pushRouterState({ url: '/test/1' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/1' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(1);

      isTransitionAllowed = null;
      promises.push(
        pushRouterState({ url: '/test/2' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/2' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(2);

      isTransitionAllowed = true;
      promises.push(
        pushRouterState({ url: '/test/3' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/3' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(3);

      isTransitionAllowed = Promise.resolve();
      promises.push(
        pushRouterState({ url: '/test/4' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/4' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(4);

      isTransitionAllowed = Promise.resolve();
      promises.push(
        pushRouterState({ url: '/test/5' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/5' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(5);

      isTransitionAllowed = Promise.resolve(false);
      promises.push(
        pushRouterState({ url: '/test/6' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual(false);

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(6);

      isTransitionAllowed = false;
      promises.push(
        pushRouterState({ url: '/test/7' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual(false);

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(7);

      isTransitionAllowed = Promise.reject();
      promises.push(
        pushRouterState({ url: '/test/8' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual(false);

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(8);

      isTransitionAllowed = Promise.resolve(true);
      promises.push(
        pushRouterState({ url: '/test/9' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/9' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(9);

      return Promise.all(promises)
      .then(() => done());
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('pushRouterState if transition is not allowed no state will be pushed', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(getRouterStateLocation()).toEqual(0);
      expect(routeChangeHandler.mock.calls.length).toEqual(1);

      isTransitionAllowed = false;
      return pushRouterState({ url: '/test/false' }, { some: 'location state' })
      .then((newState) => {

        expect(__PRIVATES__.routerStates).toEqual([
          { key: 0, state: { val: 0 } },
          { key: 1, state: { val: 1 } },
          { key: 2, state: { val: 2 } },
          { key: 3, state: { val: 3 } }
        ]);
        expect(getRouterStateLocation()).toEqual(0);
        expect(history.push).not.toHaveBeenCalled();
        expect(routeChangeHandler.mock.calls.length).toEqual(1);
        
        expect(newState).toEqual(false);
        done();

      });

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('pushRouterStateThroughChange calls isTransitionAllowed is async and pushes the new state once transition is allowed', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      isTransitionAllowed = true;

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      pushRouterStateThroughChange({ url: '/test/1' }, { some: 'location state' })
      .then((newState) => {
        expect(toUrl.mock.calls.length).toEqual(1);
        expect(toUrl.mock.calls[0]).toEqual([{ url: '/test/1', val: 0 }]);

        expect(__PRIVATES__.routerStates).toEqual([
          { key: 0, state: { val: 0 } },
          { state: { url: '/test/1', val: 0 } }
        ]);
        expect(getRouterStateLocation()).toEqual(1);

        expect(history.push.mock.calls.length).toEqual(1);
        expect(history.push.mock.calls[0]).toEqual(['/test/1', { some: 'location state', [__PRIVATES__.routerKey]: true }]);

        expect(routeChangeHandler.mock.calls.length).toEqual(2);
        expect(routeChangeHandler.mock.calls[1]).toEqual([{ url: '/test/1', val: 0 }, 1]);

        expect(newState).toEqual({ url: '/test/1', val: 0 });

        done();
      });
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('replaceRouterState calls isTransitionAllowed is async and replaces the current state once transition is allowed', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      let isTransitionAllowedResolve;
      isTransitionAllowed = new Promise((resolve) => {
        isTransitionAllowedResolve = resolve;
      });

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(getRouterStateLocation()).toEqual(0);
      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
      let transitionAllowed = false;
      replaceRouterState({ url: '/test/1' }, { some: 'location state' })
      .then((newState) => {
        transitionAllowed = true;

        expect(toUrl.mock.calls.length).toEqual(1);
        expect(toUrl.mock.calls[0]).toEqual([{ url: '/test/1' }]);

        expect(__PRIVATES__.routerStates).toEqual([
          { state: { url: '/test/1' } },
          { key: 1, state: { val: 1 } },
          { key: 2, state: { val: 2 } },
          { key: 3, state: { val: 3 } }
        ]);
        expect(getRouterStateLocation()).toEqual(0);

        expect(history.replace.mock.calls.length).toEqual(1);
        expect(history.replace.mock.calls[0]).toEqual(['/test/1', { some: 'location state', [__PRIVATES__.routerKey]: true }]);

        expect(routeChangeHandler.mock.calls.length).toEqual(2);
        expect(routeChangeHandler.mock.calls[1]).toEqual([{ url: '/test/1' }, 0, undefined]);

        expect(newState).toEqual({ url: '/test/1' });

        done();
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(1);

      globalSetTimeout(() => {
        expect(transitionAllowed).toEqual(false);
        expect(__PRIVATES__.routerStates).toEqual([
          { key: 0, state: { val: 0 } },
          { key: 1, state: { val: 1 } },
          { key: 2, state: { val: 2 } },
          { key: 3, state: { val: 3 } }
        ]);
        expect(history.replace.mock.calls.length).toEqual(0);
        isTransitionAllowedResolve();
      }, 10);
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('replaceRouterState when initKey is set pushes the state in the routerStates', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {
      isTransitionAllowed = true;

      __PRIVATES__.setRouterStateLocation(-1);
      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length);

      expect(getRouterStateLocation()).toEqual(-1);
      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
      replaceRouterState({ url: '/test/1' }, { some: 'location state', [__PRIVATES__.initKey]: true })
      .then((newState) => {

        expect(toUrl.mock.calls.length).toEqual(1);
        expect(toUrl.mock.calls[0]).toEqual([{ url: '/test/1' }]);

        expect(__PRIVATES__.routerStates).toEqual([
          { key: initKey, state: { url: '/test/1' } }
        ]);
        expect(getRouterStateLocation()).toEqual(0);

        expect(history.replace.mock.calls.length).toEqual(1);
        expect(history.replace.mock.calls[0]).toEqual(['/test/1', { some: 'location state', [__PRIVATES__.initKey]: true, [__PRIVATES__.routerKey]: true }]);

        expect(routeChangeHandler.mock.calls.length).toEqual(2);
        expect(routeChangeHandler.mock.calls[1]).toEqual([{ url: '/test/1' }, 0, true]);

        expect(newState).toEqual({ url: '/test/1' });

        done();
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(1);

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('replaceRouterState isTransitionAllowed is not called if noBlock is set', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
      replaceRouterState({ url: '/test/1' }, { some: 'location state', [__PRIVATES__.noBlockKey]: true })
      .then((newState) => {

        expect(transitionAllowedHandler.mock.calls.length).toEqual(0);

        expect(history.replace.mock.calls.length).toEqual(1);
        expect(history.replace.mock.calls[0]).toEqual(['/test/1', { some: 'location state', [__PRIVATES__.routerKey]: true, [__PRIVATES__.noBlockKey]: true }]);

        expect(newState).toEqual({ url: '/test/1' });

        done();
      });
      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('replaceRouterState transition is not allowed if isTransitionAllowed returns false a rejected promise or a promise that resolves exactly to false', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(transitionAllowedHandler.mock.calls.length).toEqual(0);

      const promises = [];

      isTransitionAllowed = undefined;
      promises.push(
        replaceRouterState({ url: '/test/1' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/1' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(1);

      isTransitionAllowed = null;
      promises.push(
        replaceRouterState({ url: '/test/2' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/2' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(2);

      isTransitionAllowed = true;
      promises.push(
        replaceRouterState({ url: '/test/3' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/3' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(3);

      isTransitionAllowed = Promise.resolve();
      promises.push(
        replaceRouterState({ url: '/test/4' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/4' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(4);

      isTransitionAllowed = Promise.resolve();
      promises.push(
        replaceRouterState({ url: '/test/5' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/5' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(5);

      isTransitionAllowed = Promise.resolve(false);
      promises.push(
        replaceRouterState({ url: '/test/6' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual(false);

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(6);

      isTransitionAllowed = false;
      promises.push(
        replaceRouterState({ url: '/test/7' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual(false);

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(7);

      isTransitionAllowed = Promise.reject();
      promises.push(
        replaceRouterState({ url: '/test/8' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual(false);

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(8);

      isTransitionAllowed = Promise.resolve(true);
      promises.push(
        replaceRouterState({ url: '/test/9' }, { some: 'location state' })
        .then((newState) => {

          expect(newState).toEqual({ url: '/test/9' });

        })
      );
      expect(transitionAllowedHandler.mock.calls.length).toEqual(9);

      return Promise.all(promises)
      .then(() => done());
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('replaceRouterState if transition is not allowed no state will be replaced', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(getRouterStateLocation()).toEqual(0);
      expect(routeChangeHandler.mock.calls.length).toEqual(1);

      isTransitionAllowed = false;
      return replaceRouterState({ url: '/test/false' }, { some: 'location state' })
      .then((newState) => {

        expect(__PRIVATES__.routerStates).toEqual([
          { key: 0, state: { val: 0 } },
          { key: 1, state: { val: 1 } },
          { key: 2, state: { val: 2 } },
          { key: 3, state: { val: 3 } }
        ]);
        expect(getRouterStateLocation()).toEqual(0);
        expect(history.replace).not.toHaveBeenCalled();
        expect(routeChangeHandler.mock.calls.length).toEqual(1);
        
        expect(newState).toEqual(false);
        done();

      });

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('replaceRouterStateThroughChange calls isTransitionAllowed is async and replaces the current state once transition is allowed', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      isTransitionAllowed = true;

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      replaceRouterStateThroughChange({ url: '/test/1' }, { some: 'location state' })
      .then((newState) => {
        expect(toUrl.mock.calls.length).toEqual(1);
        expect(toUrl.mock.calls[0]).toEqual([{ url: '/test/1', val: 0 }]);

        expect(__PRIVATES__.routerStates).toEqual([
          { state: { url: '/test/1', val: 0 } },
          { key: 1, state: { val: 1 } },
          { key: 2, state: { val: 2 } },
          { key: 3, state: { val: 3 } }
        ]);
        expect(getRouterStateLocation()).toEqual(0);

        expect(history.replace.mock.calls.length).toEqual(1);
        expect(history.replace.mock.calls[0]).toEqual(['/test/1', { some: 'location state', [__PRIVATES__.routerKey]: true }]);

        expect(routeChangeHandler.mock.calls.length).toEqual(2);
        expect(routeChangeHandler.mock.calls[1]).toEqual([{ url: '/test/1', val: 0 }, 0, undefined]);

        expect(newState).toEqual({ url: '/test/1', val: 0 });

        done();
      });
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('goInRouterStates throws an error unless delta in a non zero integer', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      try {
        goInRouterStates();
        fail('Should throw an error when delta in undefined');
        done();
        return;
      }
      catch(err) {
        expect(err.message).toEqual('goInRouterStates called with delta = "undefined" delta must be a none zero integer');
      }

      try {
        goInRouterStates(null);
        fail('Should throw an error when delta in undefined');
        done();
        return;
      }
      catch(err) {
        expect(err.message).toEqual('goInRouterStates called with delta = "null" delta must be a none zero integer');
      }

      try {
        goInRouterStates(0);
        fail('Should throw an error when delta in undefined');
        done();
        return;
      }
      catch(err) {
        expect(err.message).toEqual('goInRouterStates called with delta = "0" delta must be a none zero integer');
      }

      try {
        goInRouterStates(1.1);
        fail('Should throw an error when delta in undefined');
        done();
        return;
      }
      catch(err) {
        expect(err.message).toEqual('goInRouterStates called with delta = "1.1" delta must be a none zero integer');
      }

      try {
        goInRouterStates({});
        fail('Should throw an error when delta in undefined');
        done();
        return;
      }
      catch(err) {
        expect(err.message).toEqual('goInRouterStates called with delta = "[object Object]" delta must be a none zero integer');
      }

      expect(history.go.mock.calls.length).toEqual(0);

      goInRouterStates(2);

      expect(history.go.mock.calls.length).toEqual(1);

      done();

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('getRouterState returns current state', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      listenFunction({ key: 1 }, 'POP');

      expect(getRouterState()).toEqual({ val: 1 });
      expect(getRouterState(0)).toEqual({ val: 1 });
      expect(getRouterState(-1)).toEqual({ val: 0 });
      expect(getRouterState(1)).toEqual({ val: 2 });
      expect(getRouterState(2)).toEqual({ val: 3 });
      expect(getRouterState(3)).toEqual(undefined);
      expect(getRouterState(-2)).toEqual(undefined);

      done();

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('getRouterStateLocation returns current state location', (done) => {

    initializationHandler = null;
    expect(getRouterStateLocation()).toEqual(-1);
    const initPromise = initTest();

    initPromise.then(() => {

      expect(getRouterStateLocation()).toEqual(0);

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      listenFunction({ key: 1 }, 'POP');
      expect(getRouterStateLocation()).toEqual(1);

      listenFunction({ key: 2 }, 'POP');
      expect(getRouterStateLocation()).toEqual(2);

      listenFunction({ key: 3 }, 'POP');
      expect(getRouterStateLocation()).toEqual(3);

      done();

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('getRouterStateLength returns current length of the states', (done) => {

    initializationHandler = null;
    expect(getRouterStateLength()).toEqual(0);
    const initPromise = initTest();

    initPromise.then(() => {

      expect(getRouterStateLength()).toEqual(1);

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } }
      );

      expect(getRouterStateLength()).toEqual(2);

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      expect(getRouterStateLength()).toEqual(4);

      done();

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('isInitialised returns whether the router is initialized or not if not initializationHandler', (done) => {

    initializationHandler = null;
    expect(isInitialised()).toEqual(false);
    const initPromise = initTest();

    initPromise.then(() => {

      expect(isInitialised()).toEqual(true);

      done();

    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('isInitialised returns whether the router is initialized or not if initializationHandler rejects', (done) => {

    initializationReturn = Promise.reject();
    expect(isInitialised()).toEqual(false);
    const initPromise = initTest();

    initPromise.then(() => {
      fail('expecting init func to reject');
      done();
    })
    .catch(() => {
      expect(isInitialised()).toEqual(true);
      done();
    });
  });

  test('isInitialised returns whether the router is initialized or not if initializationHandler times out', (done) => {

    initializationReturn = new Promise(() => {});
    expect(isInitialised()).toEqual(false);
    
    initTest().then(() => {
      fail('expecting init func to reject');
      done();
    })
    .catch(() => {
      expect(isInitialised()).toEqual(true);
      done();
    });
    
    timeoutFunction();

    expect(isInitialised()).toEqual(true);

  });

});
