import { __PRIVATES__ as __PRIVATES__CORE, initializeRouter as initializeRouterCore, getRouterState as getRouterStateCore, getRouterStateLocation as getRouterStateLocationCore, getRouterStateLength as getRouterStateLengthCore, pushRouterState as pushRouterStateCore, pushRouterStateThroughChange as pushRouterStateThroughChangeCore, replaceRouterState as replaceRouterStateCore, replaceRouterStateThroughChange as replaceRouterStateThroughChangeCore, goInRouterStates as goInRouterStatesCore, isInitialised as isInitialisedCore } from '../../router/router.core'
import { __PRIVATES__ as __PRIVATES__TransitionMiddleware, isTransitionAllowed as isTransitionAllowedTransitionMiddleware, pushTransitionAllowedCheckFunction as pushTransitionAllowedCheckFunctionTransitionMiddleware } from '../../router/router.transition-middleware'
import { initializeRouter, getRouterState, getRouterStateLocation, getRouterStateLength, pushRouterState, pushRouterStateThroughChange, replaceRouterState, replaceRouterStateThroughChange, goInRouterStates, isInitialised, isTransitionAllowed, pushTransitionAllowedCheckFunction } from '../../router'

describe('router index', () => {

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
  });

  afterEach(() => {
  });

  test('exports the correct variables', (done) => {

    expect(initializeRouter).not.toEqual(initializeRouterCore);
    expect(initializeRouter.length).toEqual(initializeRouterCore.length - 1);

    expect(getRouterState).toEqual(getRouterStateCore);
    expect(getRouterStateLocation).toEqual(getRouterStateLocationCore);
    expect(getRouterStateLength).toEqual(getRouterStateLengthCore);
    expect(pushRouterState).toEqual(pushRouterStateCore);
    expect(pushRouterStateThroughChange).toEqual(pushRouterStateThroughChangeCore);
    expect(replaceRouterState).toEqual(replaceRouterStateCore);
    expect(replaceRouterStateThroughChange).toEqual(replaceRouterStateThroughChangeCore);
    expect(goInRouterStates).toEqual(goInRouterStatesCore);
    expect(isInitialised).toEqual(isInitialisedCore);
    expect(isTransitionAllowed).toEqual(isTransitionAllowedTransitionMiddleware);
    expect(pushTransitionAllowedCheckFunction).toEqual(pushTransitionAllowedCheckFunctionTransitionMiddleware);

    done();
  });

  test('sets init function of transition middleware to that of core', (done) => {
    expect(__PRIVATES__TransitionMiddleware.getIsInitialisedFunction()).toEqual(isInitialisedCore);
    done();
  });

  test('index\'s initialiseRouter sets the isTransitionAllowed function to that of the transition middleware', (done) => {
    initializeRouter(() => ({}), () => '/test', null, () => {});
    expect(__PRIVATES__CORE.getIsTransitionAllowed()).toEqual(isTransitionAllowedTransitionMiddleware);
    done();
  });
});
