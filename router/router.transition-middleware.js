import { promisifyFunctionCall } from "./router.util";

const routerTransitionAllowedCheckFunctions = [];

export const pushTransitionAllowedCheckFunction = (transitionAllowedCheckFunction, popOncePasses = true) => {
  if(typeof(transitionAllowedCheckFunction) === 'function') {
    let f;
    const popFunc = () => {
      for(let i = 0; i < routerTransitionAllowedCheckFunctions.length; i++) {
        if(routerTransitionAllowedCheckFunctions[i] === f) {
          routerTransitionAllowedCheckFunctions.splice(i, 1);
          i--;
        }
      }
    };
    if(popOncePasses) {
      f = () => {
        const ret = promisifyFunctionCall(transitionAllowedCheckFunction);
        ret.then((res) => {
          if(res !== false) {
            popFunc();
          }
        });
        return ret;
      };
    }
    else {
      f = transitionAllowedCheckFunction;
    }
    routerTransitionAllowedCheckFunctions.push(f);
    return popFunc;
  }
  else {
    console.error('pushTransitionAllowedCheckFunction attempting to push a transitionAllowedCheckFunction of type ' + typeof(transitionAllowedCheckFunction) + ' (' + transitionAllowedCheckFunction + ')');
  }
};

let isInitialised = () => false;
export const setCheckIfIsInitialisedFunction = (checkIfIsInitialisedFunction) => {
  isInitialised = checkIfIsInitialisedFunction;
};

const isTransitionAllowedHandler = () => {
  const topFunction = routerTransitionAllowedCheckFunctions[routerTransitionAllowedCheckFunctions.length - 1];
  return topFunction && promisifyFunctionCall(topFunction);
};

let isCheckingIfTransitionIsAllowed = false;
export const isTransitionAllowed = () => {
  if(!isInitialised() || isCheckingIfTransitionIsAllowed) {
    return Promise.resolve(false);
  }
  isCheckingIfTransitionIsAllowed = true;
  return Promise.resolve(isTransitionAllowedHandler())
  .catch(() => {
    isCheckingIfTransitionIsAllowed = false;
    return false;
  })
  .then((res) => {
    isCheckingIfTransitionIsAllowed = false;
    if(res !== false) {
      return true;
    }
    return false;
  });
};

export const __PRIVATES__ = {
  routerTransitionAllowedCheckFunctions,
  getIsInitialisedFunction() {
    return isInitialised;
  },
  isTransitionAllowedHandler,
  getIsCheckingIfTransitionIsAllowed() {
    return isCheckingIfTransitionIsAllowed;
  },
  reset() {
    isCheckingIfTransitionIsAllowed = false;
    isInitialised = () => false;
    routerTransitionAllowedCheckFunctions.splice(0, routerTransitionAllowedCheckFunctions.length);
  }
};
