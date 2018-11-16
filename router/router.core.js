import * as historyCreator from 'history';
import { promisifyFunctionCall } from './router.util';

const noBlockKey = Date.now() + Math.round(Math.random() * 99999999);
const initKey = Math.round(Math.random() * 999) + Date.now() + Math.round(Math.random() * 999);
const routerKey = Math.round(Math.random() * 9999) + Date.now() + Math.round(Math.random() * 9999);

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

let routerStatesLocation = -1;
const routerStates = [];

const checkIfTransitionAllowed = (location, action, callback) => {
  const noBlock = action !== 'POP' && location.state && location.state[noBlockKey];
  if(noBlock) {
    return callback(true);
  }
  Promise.resolve(isTransitionAllowed())
  .then((allowed) => callback(allowed !== false))
  .catch(() => callback(false));
};

export const __PRIVATES__ = {
  routerKey,
  noBlockKey,
  initKey,
  routerStates,
  checkIfTransitionAllowed,
  defaultMergeRouterStateChange: mergeRouterStateChange,
  blockArgsByKey: {},
  reset() {
    history = undefined;
    initialised = false;
    routerStates.splice(0, routerStates.length);
    routerStatesLocation = -1;
    mergeRouterStateChange = __PRIVATES__.defaultMergeRouterStateChange;
  },
  setRouterStateLocation(i) {
    routerStatesLocation = i;
  },
  getIsTransitionAllowed() {
    return isTransitionAllowed;
  }
};

export const initializeRouter = (transitionAllowedHandler, parseUrlFunction, toUrlFunction, mergeRouterStateChangeFunction, routerStateChangedHandler, initializationHandler, initializationTimeoutDuration = 10000, initialNoneUrlState = {}, historyType = 'browser', initUrl) => {
  return new Promise((resolve, reject) => {
    try {
      if(history) {
        reject(new Error('Called initRouter twice!!'));
        return;
      }

      let createFunctionKey = (historyType || 'browser').trim().toLowerCase();
      switch(createFunctionKey) {
        case 'browser':
          initUrl = initUrl || window.location.pathname;
          createFunctionKey = 'createBrowserHistory';
          break;
        case 'memory':
          initUrl = initUrl || '/';
          createFunctionKey = 'createMemoryHistory';
          break;
        case 'hash':
          initUrl = initUrl || window.location.hash.substr(1);
          createFunctionKey = 'createHashHistory';
          break;
        default:
          throw new Error('unknown history type "' + historyType + '"');
      }

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
          return checkIfTransitionAllowed(location, action, cb);
        }
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
          let routeAt;
          for(let i = 0; i < routerStates.length; i++) {
            if(routerStates[i].key === location.key) {
              routeAt = i;
              break;
            }
          }
          if(routeAt === undefined) {
            window.location.reload();
          }
          else {
            routerStatesLocation = routeAt;
            routerStateChanged(routerStates[routerStatesLocation].state, routerStatesLocation);
          }
        }
        else if(!location.state || !location.state[routerKey]) {
          throw new Error('Dont use other methods to change route!');
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
          initialised = true;
          if(redirect) {
            if(typeof(redirect) === 'string') {
              redirect = Object.assign({}, initialNoneUrlState, parseUrl(redirect));
            }
            resolve(replaceRouterState(Object.assign({}, initialNoneUrlState, redirect), { [noBlockKey]: true, [initKey]: true }));
          }
          else {
            routerStatesLocation = 0;
            routerStates.push({ state: initalState, key: history.location.key });
            routerStateChanged(initalState, routerStatesLocation, true);
            resolve(initalState);
          }
        })
        .catch((err) => {
          if(timeout === undefined) {
            return;
          }
          clearTimeout(timeout);
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
  return (noBlock ? Promise.resolve() : promisifyFunctionCall(isTransitionAllowed))
  .then((allowed) => {
    if(allowed !== false) {
      const url = toUrl(newState);
    
      routerStates.splice(routerStatesLocation + 1, routerStates.length - routerStatesLocation - 1, { state: newState });
      routerStatesLocation++;
    
      locationState = Object.assign({}, locationState, { [routerKey]: true });
      push(url, locationState);
    
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
  return (noBlock ? Promise.resolve() : promisifyFunctionCall(isTransitionAllowed))
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
      replace(url, locationState);
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
