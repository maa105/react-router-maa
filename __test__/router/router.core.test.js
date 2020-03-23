import * as historyCreator from 'history';
import { __PRIVATES__, BROWSER_HISTORY_TYPE, MEMORY_HISTORY_TYPE, HASH_HISTORY_TYPE, HASH_MAA_HISTORY_TYPE, initializeRouter, getRouterState, getRouterStateLocation, getRouterStateLength, pushRouterState, pushRouterStateThroughChange, replaceRouterState, replaceRouterStateThroughChange, goInRouterStates, isInitialised } from '../../router/router.core'

describe('router.core', () => {

  let parseUrl, toUrl;

  let globalSetTimeout, globalClearTimeout;
  
  let globalLocationReload;

  let initKey, initialNoneUrlState, routeChangeHandler, defaultTimeout, baseUrl;
  
  let isTransitionAllowed, transitionAllowedHandler;
  
  let initializationReturn, initializationHandler;

  let mergeFuntion;

  let getUserConfirmationFunction, history, historyReturns, location;

  let timeoutFunction, blockFunction, listenFunction;

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
    location = {
      key: initKey
    };
    jest.spyOn(historyCreator, 'createBrowserHistory').mockImplementation((options) => {
      getUserConfirmationFunction = options.getUserConfirmation;
      expect(typeof(getUserConfirmationFunction)).toEqual('function');
      return (history = {
        go: jestFn().mockImplementation(() => historyReturns.go),
        push: jestFn().mockImplementation(() => historyReturns.push),
        replace: jestFn().mockImplementation(() => historyReturns.replace),
        block: jestFn().mockImplementation(() => historyReturns.block),
        listen: jestFn().mockImplementation(() => historyReturns.listen),
        location: location
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
        location: location
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
        location: location
      });
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    global.setTimeout = globalSetTimeout;
    global.clearTimeout = globalClearTimeout;
    global.window.location.reload = globalLocationReload;
    delete global.window;
    timeoutFunction = undefined;
    blockFunction = undefined;
    listenFunction = undefined;
  });

  function initTest() {

    const initPromise = initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'browser', '/');

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

  test('initializeRouter default values for merge function and base url and history type', (done) => {

    const oldMergeRouterStateChange = __PRIVATES__.get_mergeRouterStateChange();
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, null, routeChangeHandler)
    .then(() => {
      expect(__PRIVATES__.get_mergeRouterStateChange() === oldMergeRouterStateChange).toEqual(true);
  
      expect(setTimeout.mock.calls.length).toEqual(0);
      expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(1);
      expect(historyCreator.createBrowserHistory.mock.calls[0][0].basename).toEqual('/');

      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('initializeRouter default values for timeout duration', (done) => {

    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, null, routeChangeHandler, initializationHandler)
    .then(() => {
  
      expect(setTimeout.mock.calls.length).toEqual(1);
      expect(typeof(setTimeout.mock.calls[0][0])).toEqual('function');
      expect(setTimeout.mock.calls[0][1]).toEqual(10000);

      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('initializeRouter if timeout duration is 0 it wont call set timeout', (done) => {

    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, null, routeChangeHandler, initializationHandler, 0)
    .then(() => {
  
      expect(setTimeout.mock.calls.length).toEqual(0);

      done();
    })
    .catch((err) => {
      fail(err);
      done();
    });
  });

  test('initializeRouter calls correct create history functions (using string historyType)', (done) => {

    baseUrl = '/browser-init-url';

    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'browser', '/browser-init-url');

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createBrowserHistory.mock.calls[0][0].basename).toEqual(baseUrl);
    expect(initializationHandler.mock.calls.length).toEqual(1);
    expect(initializationHandler.mock.calls[0][0]).toEqual({ url: '/', noneUrl: '123' });

    __PRIVATES__.reset();
  
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'memory', '/browser-init-url');

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createMemoryHistory.mock.calls[0][0].basename).toEqual(baseUrl);
    expect(initializationHandler.mock.calls.length).toEqual(2);
    expect(initializationHandler.mock.calls[1][0]).toEqual({ url: '/', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = '/hash-init-url';

    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'hash', '/hash-init-url');

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls[0][0].basename).toEqual(baseUrl);
    expect(initializationHandler.mock.calls.length).toEqual(3);
    expect(initializationHandler.mock.calls[2][0]).toEqual({ url: '/', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = '';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'hash-maa', '/');

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(2);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createBrowserHistory.mock.calls[1][0].basename).toEqual('/browser-init-url/#');
    expect(initializationHandler.mock.calls.length).toEqual(4);
    expect(initializationHandler.mock.calls[3][0]).toEqual({ url: '/', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = '/';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'hash-maa', '/');

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(3);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createBrowserHistory.mock.calls[2][0].basename).toEqual('/browser-init-url/#');
    expect(initializationHandler.mock.calls.length).toEqual(5);
    expect(initializationHandler.mock.calls[4][0]).toEqual({ url: '/', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = '/hash-init-url';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'hash-maa', '/hash-init-url');

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(4);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createBrowserHistory.mock.calls[3][0].basename).toEqual('/browser-init-url/#/hash-init-url');
    expect(initializationHandler.mock.calls.length).toEqual(6);
    expect(initializationHandler.mock.calls[5][0]).toEqual({ url: '/', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = undefined;
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'hash-maa', '/hash-init-url');

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(5);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createBrowserHistory.mock.calls[4][0].basename).toEqual('/browser-init-url/#');
    expect(initializationHandler.mock.calls.length).toEqual(7);
    expect(initializationHandler.mock.calls[6][0]).toEqual({ url: '/hash-init-url', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = '/test';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'browser', '/something-else')
    .then(() => {
      fail('Should fail');
      done();
    })
    .catch((err) => {
      expect(err.message).toEqual('initial url /something-else does not have a prefix /test');
      done();
    });
  });

  test('initializeRouter calls correct create history functions (using enum historyType)', (done) => {

    baseUrl = '/browser-init-url';

    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, BROWSER_HISTORY_TYPE);

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createBrowserHistory.mock.calls[0][0].basename).toEqual(baseUrl);
    expect(initializationHandler.mock.calls.length).toEqual(1);
    expect(initializationHandler.mock.calls[0][0]).toEqual({ url: '/', noneUrl: '123' });

    __PRIVATES__.reset();
  
    baseUrl = '/';

    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, MEMORY_HISTORY_TYPE);

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createMemoryHistory.mock.calls[0][0].basename).toEqual(baseUrl);
    expect(initializationHandler.mock.calls.length).toEqual(2);
    expect(initializationHandler.mock.calls[1][0]).toEqual({ url: '/', noneUrl: '123' });

    __PRIVATES__.reset();

    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, HASH_HISTORY_TYPE);

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls[0][0].basename).toEqual(baseUrl);
    expect(initializationHandler.mock.calls.length).toEqual(3);
    expect(initializationHandler.mock.calls[2][0]).toEqual({ url: '/hash-init-url', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = '';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, HASH_MAA_HISTORY_TYPE);

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(2);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createBrowserHistory.mock.calls[1][0].basename).toEqual('/browser-init-url/#');
    expect(initializationHandler.mock.calls.length).toEqual(4);
    expect(initializationHandler.mock.calls[3][0]).toEqual({ url: '/hash-init-url', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = '/';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, HASH_MAA_HISTORY_TYPE);

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(3);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createBrowserHistory.mock.calls[2][0].basename).toEqual('/browser-init-url/#');
    expect(initializationHandler.mock.calls.length).toEqual(5);
    expect(initializationHandler.mock.calls[4][0]).toEqual({ url: '/hash-init-url', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = '/hash-init-url';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, HASH_MAA_HISTORY_TYPE);

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(4);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createBrowserHistory.mock.calls[3][0].basename).toEqual('/browser-init-url/#/hash-init-url');
    expect(initializationHandler.mock.calls.length).toEqual(6);
    expect(initializationHandler.mock.calls[5][0]).toEqual({ url: '/', noneUrl: '123' });

    __PRIVATES__.reset();

    baseUrl = undefined;
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, HASH_MAA_HISTORY_TYPE);

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(5);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(1);
    expect(historyCreator.createBrowserHistory.mock.calls[4][0].basename).toEqual('/browser-init-url/#');
    expect(initializationHandler.mock.calls.length).toEqual(7);
    expect(initializationHandler.mock.calls[6][0]).toEqual({ url: '/hash-init-url', noneUrl: '123' });

    done();
  });

  test('initializeRouter should set mergeRouterStateChange if provided', (done) => {

    const state = { state: 'state', common: '1' };
    const change = { change: 'change', common: '2' };

    const oldMergeRouterStateChange = __PRIVATES__.get_mergeRouterStateChange();

    let merged = oldMergeRouterStateChange(state, change);
    expect(merged === state).toEqual(false);
    expect(merged === change).toEqual(false);
    expect(merged).toEqual({
      state: 'state',
      change: 'change',
      common: '2'
    });

    mergeFuntion = jestFn(() => {
      return { other: 'other' };
    });
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, null);
    
    const newMergeRouterStateChange = __PRIVATES__.get_mergeRouterStateChange();
    expect(newMergeRouterStateChange === mergeFuntion).toEqual(true);

    done();
  });

  test('initializeRouter fails if invalid historyType is given', (done) => {

    baseUrl = '/browser-init-url';

    const promise = initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'other');

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(0);
    expect(initializationHandler.mock.calls.length).toEqual(0);
    promise.then(() => {
      fail('invalid history type should fail');
      done();
    })
    .catch((err) => {
      expect(err.message).toEqual('unknown history type "other"');
      done();
    })
  });

  test('initializeRouter fails if called twice', (done) => {

    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState);
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState)
    .then(() => {
      fail('invalid history type should fail');
      done();
    })
    .catch((err) => {
      expect(err.message).toEqual('Called initRouter twice!!');
      done();
    });
  });

  test('initializeRouter fails if base url given is not a base of current url', (done) => {

    baseUrl = '/other';
    const promise = initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'hash-maa');

    expect(historyCreator.createBrowserHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createMemoryHistory.mock.calls.length).toEqual(0);
    expect(historyCreator.createHashHistory.mock.calls.length).toEqual(0);
    expect(initializationHandler.mock.calls.length).toEqual(0);
    promise.then(() => {
      fail('invalid history type should fail');
      done();
    })
    .catch((err) => {
      expect(err.message).toEqual('initial url /browser-init-url/#/hash-init-url does not have a prefix /browser-init-url/#/other');
      done();
    })
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

  test('initializeRouter with initializationFunction which returns falsey', (done) => {

    initializationReturn = undefined;
    const initPromise = initTest();
    
    initPromise.then((state) => {
      expect(state).toEqual({ url: '/', noneUrl: '123' });
      expect(parseUrl.mock.calls.length).toEqual(1);
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
      fail('timeout should fail initialisation');
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

  test('initializeRouter with initializationFunction which times out then initialisation handler resolves, the initialisation handler\'s resolve gets ignored', (done) => {

    let initializationResolve;
    initializationReturn = new Promise((resolve) => {
      initializationResolve = resolve;
    });
    const initPromise = initTest();

    timeoutFunction();

    initPromise.then(() => {
      fail('timeout should fail initialisation');
      done();
    })
    .catch(() => {
      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );
  
      const routeChangeHandlerCallCount = routeChangeHandler.mock.calls.length;
      initializationResolve();

      globalSetTimeout(() => {
        expect(routeChangeHandler.mock.calls.length).toEqual(routeChangeHandlerCallCount);
  
        expect(__PRIVATES__.routerStates).toEqual([
          { key: 0, state: { val: 0 } },
          { key: 1, state: { val: 1 } },
          { key: 2, state: { val: 2 } },
          { key: 3, state: { val: 3 } }
        ]);
        done();
      }, 1);
    });

  });

  test('initializeRouter with initializationFunction which times out then initialisation handler rejects, the initialisation handler\'s reject gets ignored', (done) => {

    let initializationResolve;
    initializationReturn = new Promise((resolve) => {
      initializationResolve = resolve;
    });
    const initPromise = initTest();

    timeoutFunction();

    initPromise.then(() => {
      fail('timeout should fail initialisation');
      done();
    })
    .catch(() => {
      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );
  
      const routeChangeHandlerCallCount = routeChangeHandler.mock.calls.length;
      initializationResolve(Promise.reject());

      globalSetTimeout(() => {
        expect(routeChangeHandler.mock.calls.length).toEqual(routeChangeHandlerCallCount);
  
        expect(__PRIVATES__.routerStates).toEqual([
          { key: 0, state: { val: 0 } },
          { key: 1, state: { val: 1 } },
          { key: 2, state: { val: 2 } },
          { key: 3, state: { val: 3 } }
        ]);
        done();
      }, 1);
    });

  });

  test('initializeRouter with initializationFunction times out function called after initialisation', (done) => {

    initializationReturn = undefined;
    const initPromise = initTest();

    initPromise.then(() => {
      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      const routeChangeHandlerCallCount = routeChangeHandler.mock.calls.length;
      timeoutFunction();
      expect(routeChangeHandler.mock.calls.length).toEqual(routeChangeHandlerCallCount);

      expect(__PRIVATES__.routerStates).toEqual([
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      ]);

      done();

    })
    .catch((err) => {
      fail(err);
      done();
    });

  });

  test('initializeRouter if an error is thrown synchronosly the returned promise rejects', (done) => {

    initializationHandler = null;
    location = undefined;  // to cause a error im setting history.location to undefined this way when history.location.key is accessed it will throw a synchronous error
    const initPromise = initTest();

    initPromise
    .then(() => {
      fail('synchronous errors should throw error');
      done();
    })
    .catch((err) => {
      expect(err.message).toEqual('Cannot read property \'key\' of undefined');
      done();
    });
  });

  test('hash-maa history type changes getUrlFromLocation function', (done) => {

    initializationReturn = true;

    const getUrlFromLocationOld = __PRIVATES__.get_getUrlFromLocation();
    expect(getUrlFromLocationOld({ pathname: '/pathname', hash: '#/hash-init-url/hash' })).toEqual('/pathname');
    
    const initPromise = initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, '/hash-init-url', {}, 'hash-maa', '/hash-init-url/test');

    initPromise.then(() => {
      const getUrlFromLocation = __PRIVATES__.get_getUrlFromLocation();
      expect(getUrlFromLocation === getUrlFromLocationOld).toEqual(false)
      expect(getUrlFromLocation({ pathname: '/pathname', hash: '#/hash-init-url/hash' })).toEqual('/hash');
      done();
    })
    .catch((err) => {
      fail(err);
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

  test('getUserConfirmation directly rejects case location has no key (url changed not through our functions e.g. location.hash = \'#/xyz\')', (done) => {

    initializationHandler = null;
    
    let getUrlFromLocationReturn = '/getUrlFromLocationReturn';
    const getUrlFromLocation = jestFn(() => getUrlFromLocationReturn);

    isTransitionAllowed = true;

    baseUrl = '';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'browser', '/browser-init-url')
    blockFunction = history.block.mock.calls[0][0];

    __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
      { key: 0, state: { val: 0 } },
      { key: 1, state: { val: 1 } },
      { key: 2, state: { val: 2 } },
      { key: 3, state: { val: 3 } }
    );
    
    __PRIVATES__.set_getUrlFromLocation(getUrlFromLocation);
    __PRIVATES__.setRouterStateLocation(3);

    let key = blockFunction({ pathname: '/some-path', hash: '#/base/hash-path' }, 'PUSH');
    expect(getUrlFromLocation.mock.calls.length).toEqual(0);
    expect(setTimeout.mock.calls.length).toEqual(0);
    const parseUrlCallCount = parseUrl.mock.calls.length;
    let isSync = false;
    const promise = getUserConfirmationFunction(key, function callback(allowed) {
      isSync = true;
      expect(allowed).toEqual(false);
    });
    expect(isSync).toEqual(true);
    expect(promise instanceof Promise).toEqual(true);

    expect(getUrlFromLocation.mock.calls.length).toEqual(0);
    expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
    
    expect(parseUrl.mock.calls.length).toEqual(parseUrlCallCount + 1);
    expect(parseUrl.mock.calls[parseUrlCallCount].length).toEqual(1);
    expect(parseUrl.mock.calls[parseUrlCallCount][0]).toEqual('/some-path');

    expect(setTimeout.mock.calls.length).toEqual(1);
    const timeoutTimer = setTimeout.mock.results[0].value;
    globalClearTimeout(timeoutTimer);
    expect(setTimeout.mock.calls[0].length).toEqual(2);
    const timeoutFunc = setTimeout.mock.calls[0][0];
    const timeoutDuration = setTimeout.mock.calls[0][1];
    expect(typeof(timeoutFunc)).toEqual('function');
    expect(timeoutDuration).toEqual(150);
    
    isTransitionAllowed = false;

    expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
    expect(toUrl.mock.calls.length).toEqual(0);
    expect(history.replace.mock.calls.length).toEqual(0);
    const routeChangeHandlerCallCount = routeChangeHandler.mock.calls.length;
    timeoutFunc();
    expect(transitionAllowedHandler.mock.calls.length).toEqual(0);
    expect(toUrl.mock.calls.length).toEqual(0);
    expect(history.replace.mock.calls.length).toEqual(0);
    expect(routeChangeHandler.mock.calls.length).toEqual(routeChangeHandlerCallCount);

    globalSetTimeout(() => {
      expect(toUrl.mock.calls.length).toEqual(1);
      expect(toUrl.mock.calls[0].length).toEqual(1);
      expect(toUrl.mock.calls[0][0]).toEqual({ url: '/some-path' });
      expect(__PRIVATES__.routerStates).toEqual([
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } },
        { state: { url: '/some-path' } },
      ]);

      expect(history.replace.mock.calls.length).toEqual(1);
      expect(history.replace.mock.calls[0].length).toEqual(2);
      expect(history.replace.mock.calls[0][0]).toEqual('/some-path');
      expect(history.replace.mock.calls[0][1]).toEqual({ [__PRIVATES__.noBlockKey]: true, [__PRIVATES__.overrideKey]: true, [__PRIVATES__.routerKey]: true });
      
      expect(routeChangeHandler.mock.calls.length).toEqual(routeChangeHandlerCallCount + 1);
      expect(routeChangeHandler.mock.calls[routeChangeHandlerCallCount].length).toEqual(2);
      expect(routeChangeHandler.mock.calls[routeChangeHandlerCallCount][0]).toEqual({ url: '/some-path' });
      expect(routeChangeHandler.mock.calls[routeChangeHandlerCallCount][1]).toEqual(4);
  
      promise.then((r) => {
        expect(r).toEqual(false);
        __PRIVATES__.reset();
        done();
      });
    }, 1);
  
  });

  test('getUserConfirmation uses getUrlFromLocation to get url from location only in push and replace', (done) => {

    isTransitionAllowed = true;
    initializationHandler = null;
    
    const promises = [];
    let getUrlFromLocationReturn = '/getUrlFromLocationReturn';
    const getUrlFromLocation = jestFn(() => getUrlFromLocationReturn);

    baseUrl = '';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'browser', '/browser-init-url');
    blockFunction = history.block.mock.calls[0][0];

    __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
      { key: 0, state: { val: 0 } },
      { key: 1, state: { val: 1 } },
      { key: 2, state: { val: 2 } },
      { key: 3, state: { val: 3 } }
    );
    
    __PRIVATES__.set_getUrlFromLocation(getUrlFromLocation);
    let key = blockFunction({ pathname: '/some-path', hash: '#/base/hash-path', key: 4 }, 'PUSH');
    expect(getUrlFromLocation.mock.calls.length).toEqual(0);
    promises.push(getUserConfirmationFunction(key, function callback(allowed) {
      expect(allowed).toEqual(true);
    }));
    expect(getUrlFromLocation.mock.calls.length).toEqual(1);
    expect(transitionAllowedHandler.mock.calls.length).toEqual(1);
    expect(transitionAllowedHandler.mock.calls[0][0]).toEqual({
      state: { val: 0 },
      newState: { url: '/getUrlFromLocationReturn' },
      action: 'PUSH'
    });

    __PRIVATES__.reset();

    baseUrl = '';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'browser', '/browser-init-url');
    blockFunction = history.block.mock.calls[0][0];

    __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
      { key: 0, state: { val: 0 } },
      { key: 1, state: { val: 1 } },
      { key: 2, state: { val: 2 } },
      { key: 3, state: { val: 3 } }
    );
    
    getUrlFromLocationReturn = '/getUrlFromLocationReturn2';
    __PRIVATES__.set_getUrlFromLocation(getUrlFromLocation);
    key = blockFunction({ pathname: '/some-path', hash: '#/base/hash-path', key: 5 }, 'REPLACE');
    expect(getUrlFromLocation.mock.calls.length).toEqual(1);
    promises.push(getUserConfirmationFunction(key, function callback(allowed) {
      expect(allowed).toEqual(true);
    }));
    expect(getUrlFromLocation.mock.calls.length).toEqual(2);
    expect(transitionAllowedHandler.mock.calls.length).toEqual(2);
    expect(transitionAllowedHandler.mock.calls[1][0]).toEqual({
      state: { val: 0 },
      newState: { url: '/getUrlFromLocationReturn2' },
      action: 'REPLACE'
    });

    __PRIVATES__.reset();

    baseUrl = '';
    initializeRouter(transitionAllowedHandler, parseUrl, toUrl, mergeFuntion, routeChangeHandler, initializationHandler, defaultTimeout, baseUrl, initialNoneUrlState, 'browser', '/browser-init-url');
    blockFunction = history.block.mock.calls[0][0];

    __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
      { key: 0, state: { val: 0 } },
      { key: 1, state: { val: 1 } },
      { key: 2, state: { val: 2 } },
      { key: 3, state: { val: 3 } }
    );
    
    getUrlFromLocationReturn = '/getUrlFromLocationReturn3';
    __PRIVATES__.set_getUrlFromLocation(getUrlFromLocation);
    key = blockFunction({ pathname: '/some-path', hash: '#/base/hash-path', key: 2 }, 'POP');
    expect(getUrlFromLocation.mock.calls.length).toEqual(2);
    promises.push(getUserConfirmationFunction(key, function callback(allowed) {
      expect(allowed).toEqual(true);
    }));
    expect(getUrlFromLocation.mock.calls.length).toEqual(2);
    expect(transitionAllowedHandler.mock.calls.length).toEqual(3);
    expect(transitionAllowedHandler.mock.calls[2][0]).toEqual({
      state: { val: 0 },
      newState: { val: 2 },
      action: 'POP'
    });

    __PRIVATES__.reset();

    Promise.all(promises).then(() => {
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

    const promises = [];

    initPromise.then((state) => {

      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );

      let key = blockFunction({ key: 2 }, 'POP');
      isTransitionAllowed = undefined;
      promises.push(getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      }));
      expect(transitionAllowedHandler.mock.calls.length).toEqual(1);
      expect(transitionAllowedHandler.mock.calls[0][0]).toEqual({
        state: { val: 0 },
        newState: { val: 2 },
        action: 'POP'
      });
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({ pathname: '/some-path', key: 7 }, 'PUSH');
      isTransitionAllowed = true;
      promises.push(getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      }));
      expect(transitionAllowedHandler.mock.calls.length).toEqual(2);
      expect(transitionAllowedHandler.mock.calls[1][0]).toEqual({
        state: { val: 0 },
        newState: { url: '/some-path' },
        action: 'PUSH'
      });
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);
      
      key = blockFunction({ pathname: '/some-path', key: 8 }, 'REPLACE');
      isTransitionAllowed = {};
      promises.push(getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      }));
      expect(transitionAllowedHandler.mock.calls.length).toEqual(3);
      expect(transitionAllowedHandler.mock.calls[2][0]).toEqual({
        state: { val: 0 },
        newState: { url: '/some-path' },
        action: 'REPLACE'
      });
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({ url: '/some-path', key: 9 }, 'PUSH');
      isTransitionAllowed = null;
      promises.push(getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      }));
      expect(transitionAllowedHandler.mock.calls.length).toEqual(4);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({ url: '/some-path', key: 10 }, 'PUSH');
      isTransitionAllowed = false;
      promises.push(getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(false);
      }));
      expect(transitionAllowedHandler.mock.calls.length).toEqual(5);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({ url: '/some-path', key: 11 }, 'PUSH');
      isTransitionAllowed = Promise.reject();
      promises.push(getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(false);
      }));
      expect(transitionAllowedHandler.mock.calls.length).toEqual(6);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      key = blockFunction({ url: '/some-path', key: 12 }, 'PUSH');
      isTransitionAllowed = Promise.resolve();
      promises.push(getUserConfirmationFunction(key, function callback(allowed) {
        expect(allowed).toEqual(true);
      }));
      expect(transitionAllowedHandler.mock.calls.length).toEqual(7);
      expect(__PRIVATES__.blockArgsByKey[key]).toEqual(undefined);

      return Promise.all(promises);
    })
    .then(() => {
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

      const key = blockFunction({ key: 13}, 'PUSH');
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

      const key = blockFunction({ state: { [__PRIVATES__.noBlockKey]: true }, key: 14 }, 'PUSH');
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

      const key = blockFunction({ state: { [__PRIVATES__.noBlockKey]: true }, key: 15 }, 'POP');
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

  test('listen function if not pop and routerKey is not set pushes or pops a state that it parses from getUrlFromLocation', (done) => {

    initializationHandler = null;
    let getUrlFromLocationReturn = '/getUrlFromLocationReturn';
    const getUrlFromLocation = jestFn(() => getUrlFromLocationReturn);

    const initPromise = initTest();


    initPromise.then(() => {
      __PRIVATES__.set_getUrlFromLocation(getUrlFromLocation);
      __PRIVATES__.routerStates.splice(0, __PRIVATES__.routerStates.length,
        { key: 0, state: { val: 0 } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      );
  
      expect(getUrlFromLocation.mock.calls.length).toEqual(0);
      expect(routeChangeHandler.mock.calls.length).toEqual(1);
      listenFunction({ key: -1 }, 'REPLACE');
      expect(getUrlFromLocation.mock.calls.length).toEqual(1);
      expect(routeChangeHandler.mock.calls.length).toEqual(2);
      expect(routeChangeHandler.mock.calls[1]).toEqual([{ url: '/getUrlFromLocationReturn' }, 0]);
      
      expect(__PRIVATES__.routerStates).toEqual([
        { key: -1, state: { url: '/getUrlFromLocationReturn' } },
        { key: 1, state: { val: 1 } },
        { key: 2, state: { val: 2 } },
        { key: 3, state: { val: 3 } }
      ]);

      getUrlFromLocationReturn = '/getUrlFromLocationReturn2'
      expect(getUrlFromLocation.mock.calls.length).toEqual(1);
      expect(routeChangeHandler.mock.calls.length).toEqual(2);
      listenFunction({ key: 4 }, 'PUSH');
      expect(getUrlFromLocation.mock.calls.length).toEqual(2);
      expect(routeChangeHandler.mock.calls.length).toEqual(3);
      expect(routeChangeHandler.mock.calls[2]).toEqual([{ url: '/getUrlFromLocationReturn2' }, 1]);
      
      expect(__PRIVATES__.routerStates).toEqual([
        { key: -1, state: { url: '/getUrlFromLocationReturn' } },
        { key: 4, state: { url: '/getUrlFromLocationReturn2' } }
      ]);

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

        expect(transitionAllowedHandler.mock.calls.length).toEqual(1);
        expect(transitionAllowedHandler.mock.calls[0][0]).toEqual({
          state: { val: 0 },
          newState: { url: '/test/1' },
          action: 'PUSH'
        });

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

  test('pushRouterState if override is set in locationState calls history.replace instead of history.push', (done) => {

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
      pushRouterState({ url: '/test/1' }, { some: 'location state', [__PRIVATES__.overrideKey]: true })
      .then((newState) => {
        transitionAllowed = true;

        expect(transitionAllowedHandler.mock.calls.length).toEqual(1);
        expect(transitionAllowedHandler.mock.calls[0][0]).toEqual({
          state: { val: 0 },
          newState: { url: '/test/1' },
          action: 'PUSH'
        });

        expect(toUrl.mock.calls.length).toEqual(1);
        expect(toUrl.mock.calls[0]).toEqual([{ url: '/test/1' }]);

        expect(__PRIVATES__.routerStates).toEqual([
          { key: 0, state: { val: 0 } },
          { state: { url: '/test/1' } }
        ]);
        expect(getRouterStateLocation()).toEqual(1);

        expect(history.push.mock.calls.length).toEqual(0);
        expect(history.replace.mock.calls.length).toEqual(1);
        expect(history.replace.mock.calls[0]).toEqual(['/test/1', { some: 'location state', [__PRIVATES__.overrideKey]: true, [__PRIVATES__.routerKey]: true }]);

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

  test('pushRouterStateThroughChange calls merge function', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      isTransitionAllowed = true;

      const mergeRouterStateChange = jestFn(() => {
        return { other: 'other' };
      });
      __PRIVATES__.set_mergeRouterStateChange(mergeRouterStateChange);

      pushRouterStateThroughChange({ url: '/test/1' }, { some: 'location state' })
      .then((newState) => {

        expect(newState).toEqual({
          other: 'other'
        });
        expect(mergeRouterStateChange.mock.calls.length).toEqual(1);
        expect(mergeRouterStateChange.mock.calls[0]).toEqual([
          {"noneUrl": "123", "url": "/"},
          { url: '/test/1' }
        ]);

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

        expect(transitionAllowedHandler.mock.calls.length).toEqual(1);
        expect(transitionAllowedHandler.mock.calls[0][0]).toEqual({
          state: { val: 0 },
          newState: { url: '/test/1', val: 0 },
          action: 'PUSH'
        });

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

        expect(transitionAllowedHandler.mock.calls.length).toEqual(1);
        expect(transitionAllowedHandler.mock.calls[0][0]).toEqual({
          state: { val: 0 },
          newState: { url: '/test/1' },
          action: 'REPLACE'
        });

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

  test('replaceRouterState if override is set in locationState calls history.push instead of history.replace', (done) => {

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
      replaceRouterState({ url: '/test/1' }, { some: 'location state', [__PRIVATES__.overrideKey]: true })
      .then((newState) => {
        transitionAllowed = true;

        expect(transitionAllowedHandler.mock.calls.length).toEqual(1);
        expect(transitionAllowedHandler.mock.calls[0][0]).toEqual({
          state: { val: 0 },
          newState: { url: '/test/1' },
          action: 'REPLACE'
        });

        expect(toUrl.mock.calls.length).toEqual(1);
        expect(toUrl.mock.calls[0]).toEqual([{ url: '/test/1' }]);

        expect(__PRIVATES__.routerStates).toEqual([
          { state: { url: '/test/1' } },
          { key: 1, state: { val: 1 } },
          { key: 2, state: { val: 2 } },
          { key: 3, state: { val: 3 } }
        ]);
        expect(getRouterStateLocation()).toEqual(0);

        expect(history.replace.mock.calls.length).toEqual(0);
        expect(history.push.mock.calls.length).toEqual(1);
        expect(history.push.mock.calls[0]).toEqual(['/test/1', { some: 'location state', [__PRIVATES__.overrideKey]: true, [__PRIVATES__.routerKey]: true }]);

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

  test('replaceRouterState when initKey is set replaces the state in the routerStates', (done) => {

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

  test('replaceRouterStateThroughChange calls merge function', (done) => {

    initializationHandler = null;
    const initPromise = initTest();

    initPromise.then(() => {

      isTransitionAllowed = true;

      const mergeRouterStateChange = jestFn(() => {
        return { other: 'other' };
      });
      __PRIVATES__.set_mergeRouterStateChange(mergeRouterStateChange);

      replaceRouterStateThroughChange({ url: '/test/1' }, { some: 'location state' })
      .then((newState) => {

        expect(newState).toEqual({
          other: 'other'
        });
        expect(mergeRouterStateChange.mock.calls.length).toEqual(1);
        expect(mergeRouterStateChange.mock.calls[0]).toEqual([
          {"noneUrl": "123", "url": "/"},
          { url: '/test/1' }
        ]);

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

        expect(transitionAllowedHandler.mock.calls.length).toEqual(1);
        expect(transitionAllowedHandler.mock.calls[0][0]).toEqual({
          state: { val: 0 },
          newState: { url: '/test/1', val: 0 },
          action: 'REPLACE'
        });

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
