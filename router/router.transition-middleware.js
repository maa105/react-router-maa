import { promisifyFunctionCall, sortedInsert } from "./router.util";

const routerTransitionAllowedChecks = [];
const routerTransitionAllowedChecksPushFunctionsStack = [];

const AllowNavigationResult = { ForceAllow: true, Deny: false, DontCare: undefined };

const priorityComareFunc = (a, b) => a.priority - b.priority;

export const pushTransitionAllowedCheckFunction = (checkFunc, popOnceRouteAllowed = true, priority = 0, popCheckFunc = undefined) => {
  if(typeof(checkFunc) === 'function') {
    let obj = { checkFunc, popOnceRouteAllowed, priority, popCheckFunc };
    const pushFunc = sortedInsert.bind(null, routerTransitionAllowedChecks, obj, priorityComareFunc);
    const popFunc = () => {
      for(let i = 0; i < routerTransitionAllowedChecks.length; i++) {
        if(routerTransitionAllowedChecks[i] === obj) {
          routerTransitionAllowedChecks.splice(i, 1);
          return;
        }
      }
      for(let i = 0; i < routerTransitionAllowedChecksPushFunctionsStack.length; i++) {
        if(routerTransitionAllowedChecksPushFunctionsStack[i] === pushFunc) {
          routerTransitionAllowedChecksPushFunctionsStack.splice(i, 1);
          return;
        }
      }
    };
    if(isCheckingIfTransitionIsAllowed) {
      routerTransitionAllowedChecksPushFunctionsStack.push(pushFunc);
    }
    else {
      pushFunc();
    }
    return popFunc;
  }
  else {
    console.error('pushTransitionAllowedCheckFunction attempting to push a transitionAllowedCheckFunction of type ' + typeof(checkFunc) + ' (' + checkFunc + ')');
  }
};

let isInitialised = () => false;
export const setCheckIfIsInitialisedFunction = (checkIfIsInitialisedFunction) => {
  isInitialised = checkIfIsInitialisedFunction;
};

const isTransitionAllowedHandler = (e) => {
  return isTransitionAllowedHandlerHelper(e, routerTransitionAllowedChecks.length - 1)
  .then((allowed) => {
    for(let i = routerTransitionAllowedChecks.length - 1; i >= 0; i--) {
      if(routerTransitionAllowedChecks[i].doPop === true) {
        routerTransitionAllowedChecks.splice(i, 1);
      }
    }
    if(allowed !== AllowNavigationResult.Deny) {
      for(let i = routerTransitionAllowedChecks.length - 1; i >= 0; i--) {
        if(routerTransitionAllowedChecks[i].popOnceRouteAllowed || (routerTransitionAllowedChecks[i].popCheckFunc && routerTransitionAllowedChecks[i].popCheckFunc(e))) {
          routerTransitionAllowedChecks.splice(i, 1);
        }
      }
      return AllowNavigationResult.ForceAllow;
    }
    return AllowNavigationResult.Deny;
  });
};
const isTransitionAllowedHandlerHelper = (e, i) => {
  const top = routerTransitionAllowedChecks[i];
  if(top) {
    e = Object.assign({}, e, { popMe: () => {
      top.doPop = true;
    } });
    return promisifyFunctionCall(top.checkFunc, [e])
    .catch(() => AllowNavigationResult.Deny)
    .then(function(allow) {
      if(allow === AllowNavigationResult.ForceAllow || allow === AllowNavigationResult.Deny) {
        return allow;
      }
      if(i > 0) {
        return isTransitionAllowedHandlerHelper(e, i - 1)
        .then((othersAllow) => {
          if(othersAllow === AllowNavigationResult.ForceAllow || othersAllow === AllowNavigationResult.Deny) {
            return othersAllow;
          }
        });
      }
    });
  }
  return Promise.resolve(AllowNavigationResult.ForceAllow);
};

let isCheckingIfTransitionIsAllowed = false;
export const isTransitionAllowed = (e) => {
  if(!isInitialised() || isCheckingIfTransitionIsAllowed) {
    return Promise.resolve(false);
  }
  isCheckingIfTransitionIsAllowed = true;
  return isTransitionAllowedHandler(e)
  .then((res) => {
    isCheckingIfTransitionIsAllowed = false;
    for(let i = 0; i < routerTransitionAllowedChecksPushFunctionsStack.length; i++) {
      routerTransitionAllowedChecksPushFunctionsStack[i]();
    }
    routerTransitionAllowedChecksPushFunctionsStack.splice(0, routerTransitionAllowedChecksPushFunctionsStack.length);
    return res;
  });
};

export const __PRIVATES__ = {
  routerTransitionAllowedChecks,
  getIsInitialisedFunction() {
    return isInitialised;
  },
  isTransitionAllowedHandler,
  getIsCheckingIfTransitionIsAllowed() {
    return isCheckingIfTransitionIsAllowed;
  },
  getRouterTransitionAllowedChecksPushFunctionsStack() {
    return routerTransitionAllowedChecksPushFunctionsStack;
  },
  getRouterTransitionAllowedChecks() {
    return routerTransitionAllowedChecks;
  },
  reset() {
    isCheckingIfTransitionIsAllowed = false;
    isInitialised = () => false;
    routerTransitionAllowedChecks.splice(0, routerTransitionAllowedChecks.length);
  }
};
