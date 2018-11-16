import { pushRouterStateThroughChange, replaceRouterStateThroughChange, getRouterStateLength, isInitialised, getRouterState, getRouterStateLocation, goInRouterStates, initializeRouter as initializeRouterCore, pushRouterState, replaceRouterState } from './router.core';
import { setCheckIfIsInitialisedFunction, isTransitionAllowed, pushTransitionAllowedCheckFunction } from './router.transition-middleware';

export { isInitialised };
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

export const initializeRouter = (parseUrlFunction, toUrlFunction, mergeRouterStateChangeFunction, routerStateChangedHandler, initializationHandler, initializationTimeoutDuration = 10000, initialNoneUrlState = {}, historyType = 'browser') => {
  return initializeRouterCore(isTransitionAllowed, parseUrlFunction, toUrlFunction, mergeRouterStateChangeFunction, routerStateChangedHandler, initializationHandler, initializationTimeoutDuration, initialNoneUrlState, historyType);
};
