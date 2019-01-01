import { BROWSER_HISTORY_TYPE, HASH_MAA_HISTORY_TYPE, HASH_HISTORY_TYPE, MEMORY_HISTORY_TYPE, pushRouterStateThroughChange, replaceRouterStateThroughChange, getRouterStateLength, isInitialised, getRouterState, getRouterStateLocation, goInRouterStates, initializeRouter as initializeRouterCore, pushRouterState, replaceRouterState } from './router.core';
import { setCheckIfIsInitialisedFunction, isTransitionAllowed, pushTransitionAllowedCheckFunction } from './router.transition-middleware';

export { isInitialised };
export { BROWSER_HISTORY_TYPE };
export { HASH_MAA_HISTORY_TYPE };
export { HASH_HISTORY_TYPE };
export { MEMORY_HISTORY_TYPE };
export { pushRouterStateThroughChange };
export { pushRouterState };
export { replaceRouterStateThroughChange };
export { replaceRouterState };
export { goInRouterStates };
export { getRouterState };
export { getRouterStateLocation };
export { getRouterStateLength };

export { isTransitionAllowed };
export { pushTransitionAllowedCheckFunction };

setCheckIfIsInitialisedFunction(isInitialised);

export const initializeRouter = (parseUrlFunction, toUrlFunction, mergeRouterStateChangeFunction, routerStateChangedHandler, initializationHandler, initializationTimeoutDuration, baseUrl, initialNoneUrlState, historyType) => {
  return initializeRouterCore(isTransitionAllowed, parseUrlFunction, toUrlFunction, mergeRouterStateChangeFunction, routerStateChangedHandler, initializationHandler, initializationTimeoutDuration, baseUrl, initialNoneUrlState, historyType);
};
