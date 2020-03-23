import * as historyCreator from 'history';
import { promisifyFunctionCall, ensureSlashPrefix, ensureSlashSuffix, trimSlashSuffix } from './router.util';

const noBlockKey = Date.now() + Math.round(Math.random() * 99999999);
const initKey = Math.round(Math.random() * 999) + Date.now() + Math.round(Math.random() * 999);
const routerKey = Math.round(Math.random() * 9999) + Date.now() + Math.round(Math.random() * 9999);
const overrideKey = Math.round(Math.random() * 9999) + Date.now() + Math.round(Math.random() * 9999);

let initialised = false;

let history;
let parseUrl;
let toUrl;
let routerStateChanged;
let isTransitionAllowed;
let mergeRouterStateChange = (state, change) => Object.assign({}, state, change);

let go;
let push;
let replace;

export const MEMORY_HISTORY_TYPE = 1;
export const BROWSER_HISTORY_TYPE = 2;
export const HASH_HISTORY_TYPE = 3;
export const HASH_MAA_HISTORY_TYPE = 4;

let routerStatesLocation = -1;
const routerStates = [];

const checkIfTransitionAllowed = (location, action, callback) => {
  const noBlock = action !== 'POP' && location.state && location.state[noBlockKey];
  if(noBlock) {
    return callback(true);
  }
  let newState;
  if(action === 'POP') {
    newState = getRouterState(getStateIndexByKey(location.key) - routerStatesLocation);
  }
  else {
    newState = parseUrl(getUrlFromLocation(location));
  }
  return promisifyFunctionCall(isTransitionAllowed, [{
    state: getRouterState(),
    newState: newState,
    action
  }])
  .then((allowed) => callback(allowed !== false))
  .catch(() => callback(false));
};

const getStateIndexByKey = (key) => {
  for(let i = 0; i < routerStates.length; i++) {
    if(routerStates[i].key === key) {
      return i;
    }
  }
};

let getUrlFromLocation = (location) => {
  return location.pathname;
};

export const __PRIVATES__ = {
  routerKey,
  noBlockKey,
  initKey,
  overrideKey,
  routerStates,
  checkIfTransitionAllowed,
  defaultMergeRouterStateChange: mergeRouterStateChange,
  defaultGetUrlFromLocation: getUrlFromLocation,
  blockArgsByKey: {},
  getStateIndexByKey,
  reset() {
    history = undefined;
    initialised = false;
    routerStates.splice(0, routerStates.length);
    routerStatesLocation = -1;
    mergeRouterStateChange = __PRIVATES__.defaultMergeRouterStateChange;
    getUrlFromLocation = __PRIVATES__.defaultGetUrlFromLocation;
  },
  setRouterStateLocation(i) {
    routerStatesLocation = i;
  },
  get_isTransitionAllowed() {
    return isTransitionAllowed;
  },
  get_getUrlFromLocation() {
    return getUrlFromLocation;
  },
  set_getUrlFromLocation(_getUrlFromLocation) {
    getUrlFromLocation = _getUrlFromLocation;
  },
  get_mergeRouterStateChange() {
    return mergeRouterStateChange;
  },
  set_mergeRouterStateChange(_mergeRouterStateChange) {
    mergeRouterStateChange = _mergeRouterStateChange;
  }
};

export const initializeRouter = (transitionAllowedHandler, parseUrlFunction, toUrlFunction, mergeRouterStateChangeFunction, routerStateChangedHandler, initializationHandler, initializationTimeoutDuration = 10000, baseUrl = '', initialNoneUrlState = {}, historyType = 'browser', initUrl) => {
  return new Promise((resolve, reject) => {
    try {
      if(history) {
        reject(new Error('Called initRouter twice!!'));
        return;
      }

      let createFunctionKey = historyType || BROWSER_HISTORY_TYPE;
      if(typeof(historyType) === 'string') {
        historyType = historyType.trim().toLocaleLowerCase();
      }

      switch(createFunctionKey) {
        case 'browser':
        case BROWSER_HISTORY_TYPE:
          initUrl = initUrl || window.location.pathname;
          createFunctionKey = 'createBrowserHistory';
          break;
        case 'memory':
        case MEMORY_HISTORY_TYPE:
          initUrl = initUrl || '/';
          createFunctionKey = 'createMemoryHistory';
          break;
        case 'hash':
        case HASH_HISTORY_TYPE:
          initUrl = initUrl || window.location.hash.substr(1);
          createFunctionKey = 'createHashHistory';
          break;
        case 'hash-maa':
        case HASH_MAA_HISTORY_TYPE:
          const pathname = ensureSlashSuffix(ensureSlashPrefix(window.location.pathname));

          initUrl = ensureSlashPrefix(initUrl || window.location.hash.substr(1));
          baseUrl = (baseUrl && ensureSlashPrefix(baseUrl)) || '';

          getUrlFromLocation = ((baseUrl, location) => {
            return ensureSlashPrefix(location.hash.substr(1 + baseUrl.length));
          }).bind(null, baseUrl);

          initUrl = pathname + '#' + initUrl;
          baseUrl = pathname + '#' + baseUrl;

          createFunctionKey = 'createBrowserHistory';

          break;
        default:
          reject(Error('unknown history type "' + historyType + '"'));
          return;
      }

      initUrl = ensureSlashPrefix(initUrl);
      baseUrl = (baseUrl && trimSlashSuffix(ensureSlashPrefix(baseUrl))) || '/';

      if(initUrl.toLocaleLowerCase().indexOf(baseUrl.toLowerCase()) !== 0) {
        reject(Error('initial url ' + initUrl + ' does not have a prefix ' + baseUrl));
        return;
      }

      initUrl = ensureSlashPrefix(initUrl.substr(baseUrl.length));

      isTransitionAllowed = transitionAllowedHandler;
      parseUrl = parseUrlFunction;
      toUrl = toUrlFunction;
      mergeRouterStateChange = mergeRouterStateChangeFunction || mergeRouterStateChange;
      routerStateChanged = routerStateChangedHandler;
      
      const blockArgsByKey = __PRIVATES__.blockArgsByKey;
      history = historyCreator[createFunctionKey]({
        getUserConfirmation: (key, cb) => {
          const { location, action } = blockArgsByKey[key];
          delete blockArgsByKey[key];
          if(!location.key) { // history state changed not through our function e.g. location.hash = '#/xyz';
            const toBeState = parseUrlFunction(location.pathname);
            cb(false);
            setTimeout(() => {
              pushRouterState(toBeState, { [noBlockKey]: true, [overrideKey]: true });
            }, 150);
            return Promise.resolve(false);
          }
          return checkIfTransitionAllowed(location, action, cb);
        },
        basename: baseUrl
      });
    
      go = history.go.bind(history);
      push = history.push.bind(history);
      replace = history.replace.bind(history);

      history.block((location, action) => {
        const key = Math.round(Math.random() * 99999999) + '-' + Date.now() + '-' + Math.round(Math.random() * 99999999);
        blockArgsByKey[key] = { location, action };
        return key;
      });
    
      history.listen((location, action) => {
        if(action === 'POP') {
          let routeAt = getStateIndexByKey(location.key);
          if(routeAt === undefined) {
            window.location.reload();
          }
          else {
            routerStatesLocation = routeAt;
            routerStateChanged(routerStates[routerStatesLocation].state, routerStatesLocation);
          }
        }
        else if(!location.state || !location.state[routerKey]) {
          const newState = parseUrl(getUrlFromLocation(location));

          if(action === 'PUSH') {
            routerStates.splice(routerStatesLocation + 1, routerStates.length - routerStatesLocation - 1, { state: newState, key: location.key });
            routerStatesLocation++;
          }
          else {
            routerStates[routerStatesLocation] = { state: newState, key: location.key };
          }
        
          routerStateChanged(newState, routerStatesLocation);
        }
        else {
          routerStates[routerStatesLocation].key = location.key;
        }
      });
    
      const initalState = Object.assign({}, initialNoneUrlState, parseUrl(initUrl));
      if(initializationHandler) {
        let timeout = null;
        if(initializationTimeoutDuration) {
          timeout = setTimeout(() => {
            if(timeout === undefined) {
              return;
            }
            timeout = undefined;
            initialised = true;
            routerStatesLocation = 0;
            routerStates.push({ state: initalState, key: history.location.key });
            routerStateChanged(initalState, routerStatesLocation, true);
            reject(new Error((initializationTimeoutDuration / 1000) + ' seconds passed and the router haven\'t initialised yet'));
          }, initializationTimeoutDuration);
        }
        promisifyFunctionCall(initializationHandler, [initalState])
        .then((redirect) => {
          if(timeout === undefined) {
            return;
          }
          clearTimeout(timeout);
          timeout = undefined;
          initialised = true;
          if(redirect) {
            if(typeof(redirect) === 'string') {
              redirect = Object.assign({}, initialNoneUrlState, parseUrl(redirect));
            }
            resolve(replaceRouterState(Object.assign({}, initialNoneUrlState, redirect), { [noBlockKey]: true, [initKey]: true }));
          }
          else {
            resolve(replaceRouterState(initalState, { [noBlockKey]: true, [initKey]: true }));
          }
        })
        .catch((err) => {
          if(timeout === undefined) {
            return;
          }
          clearTimeout(timeout);
          timeout = undefined;
          initialised = true;
          routerStatesLocation = 0;
          routerStates.push({ state: initalState, key: history.location.key });
          routerStateChanged(initalState, routerStatesLocation, true);
          reject(err);
        });
      }
      else {
        initialised = true;
        routerStatesLocation = 0;
        routerStates.push({ state: initalState, key: history.location.key });
        routerStateChanged(initalState, routerStatesLocation, true);
        resolve(initalState);
      }
    }
    catch(err) {
      reject(err);
    }
  });
};

export const pushRouterStateThroughChange = function(change, locationState) {
  const newState = mergeRouterStateChange(routerStates[routerStatesLocation].state, change);
  return pushRouterState(newState, locationState);
};
export const pushRouterState = function(newState, locationState) {
  const noBlock = locationState && locationState[noBlockKey];
  return (noBlock ? Promise.resolve() : promisifyFunctionCall(isTransitionAllowed, [{
    state: getRouterState(),
    newState: newState,
    action: 'PUSH'
  }]))
  .then((allowed) => {
    if(allowed !== false) {
      const url = toUrl(newState);
    
      routerStates.splice(routerStatesLocation + 1, routerStates.length - routerStatesLocation - 1, { state: newState });
      routerStatesLocation++;
    
      locationState = Object.assign({}, locationState, { [routerKey]: true });
      if(locationState[overrideKey]) {
        replace(url, locationState);
      }
      else {
        push(url, locationState);
      }

      routerStateChanged(newState, routerStatesLocation);
      return newState;
    }
    return false;
  }).catch(() => false);
};
export const replaceRouterStateThroughChange = function(change, locationState) {
  const newState = mergeRouterStateChange(routerStates[routerStatesLocation].state, change);
  return replaceRouterState(newState, locationState);
};
export const replaceRouterState = function(newState, locationState) {
  const noBlock = locationState && locationState[noBlockKey];
  return (noBlock ? Promise.resolve() : promisifyFunctionCall(isTransitionAllowed, [{
    state: getRouterState(),
    newState: newState,
    action: 'REPLACE'
  }]))
  .then((allowed) => {
    if(allowed !== false) {
      const url = toUrl(newState);
    
      const isInit = locationState && locationState[initKey];

      if(isInit) {
        routerStatesLocation = 0;
        routerStates.push({ state: newState, key: history.location.key });
      }
      else {
        routerStates[routerStatesLocation] = { state: newState };
      }
      
      locationState = Object.assign({}, locationState, { [routerKey]: true });
      if(locationState[overrideKey]) {
        push(url, locationState);
      }
      else {
        replace(url, locationState);
      }

      routerStateChanged(newState, routerStatesLocation, isInit);
      return newState;
    }
    return false;
  }).catch(() => false);
};
export const goInRouterStates = function(delta) {
  if(!delta || typeof(delta) !== 'number' || Math.round(delta) !== delta) {
    throw new Error('goInRouterStates called with delta = "' + delta + '" delta must be a none zero integer');
  }
  go(delta);
};

export const getRouterState = (delta) => {
  delta = delta || 0;
  const state = routerStates[routerStatesLocation + delta];
  if(state) {
    return Object.assign({}, state.state);
  }
};
export const getRouterStateLocation = () => {
  return routerStatesLocation;
};
export const getRouterStateLength = () => {
  return routerStates.length;
};
export const isInitialised = () => {
  return initialised;
};
