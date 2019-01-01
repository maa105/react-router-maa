[![Build Status](https://travis-ci.com/maa105/react-router-maa.svg?branch=master)](https://travis-ci.com/maa105/react-router-maa) [![Coverage Status](https://coveralls.io/repos/github/maa105/react-router-maa/badge.svg?branch=master)](https://coveralls.io/github/maa105/react-router-maa?branch=master)

# Router Overview

State based router for react (and others not explicit to react). The idea is simple I want the url of the site to be linked to a state object. To do so the user supplies the router with a parseUrl and a toUrl function. And changing the url is done by changing the state object.

The router has a built in async (by returning a promise) initialisation phase which can be utilised by supplying the initializeRouter the initializationHandler parameter which if it return a state or a url(string) will set the initial url of the site (if it returns falsey value the initial url will not change). Note you can return a promise for async functionality. This is important for example if the initial url is say /user/:userId and you want to get the user info from the server and if no user is available with set id u want to redirect to another page say /home.

The router provides out of the box a working async route blocking mechanism available through pushTransitionAllowedCheckFunction. Where you add a function to be called before route is changed and if this function returns false the route will not change (utilise promises for async operation).

The state of the router is saved internally inside the router. To hook it to your react app use something like bellow which is specific to redux ([full example here](https://github.com/maa105/react-router-maa/tree/master/example)):

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers';
import './index.css';
import App from './components/App';
import { changeRouterState, initRouter } from './actions';
import { initializeRouter } from 'react-router-maa';
import { parseUrl, toUrl } from './utils';

const store = createStore(rootReducer);

initializeRouter(parseUrl, toUrl, null, (state, position, isInit) => {
  store.dispatch(changeRouterState(state, position, isInit));
}, (initState) => {
  return new Promise((resolve) => {
    store.dispatch(initRouter(initState, resolve));
  });
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, 
  document.getElementById('root')
);

```

# Example

I created a small app to demonstrate the router in action [check example here](https://github.com/maa105/react-router-maa/tree/master/example).

I highly recommend checking the example as it helps demonstrate the power of this router in real world senarios. Even if you dont download and run the example locally checking the readme of the example is useful also.

# API

## initializeRouter(parseUrlFunction, toUrlFunction, mergeRouterStateChangeFunction, routerStateChangedHandler, initializationHandler, initializationTimeoutDuration = 10000, baseUrl='', initialNoneUrlState = {}, historyType = 'browser')

### parseUrlFunction(url: string)

a function that takes in a url string and returns a state object.

### toUrlFunction(state: Object)

a function that takes in a state object and returns a url string.

### mergeRouterStateChangeFunction(state: Object, change: Object)

a function that takes in a state object and (state) change object and returns the new state (dont mutate state or else). send it as null (or falsey in general) to use Object.assign. in most cases you'll just send this as null.

### routerStateChangedHandler(newState: Object, stateLocation: integer[, isInit: Boolean])

a function to be called every time the router state changed it will be given the newState as first argument, the stateLocation as the second (think of stateLocation as position in the states objects the current state is. when the site first load stateLocation is 0 if you push a new state it becomes 1), and isInit as the third argument this is set to true when the first state is set.

### initializationHandler(initialState: Object)

a function that will be called upon initialization of the router. It will be supplied the initial state which is parsed from the initial url (window.location.pathname or window.location.hash) and merged with initialNoneUrlState(another argument). If this function returns an object it will be used as the initialState instead and the url changed accordingly (using the toUrl function) or if it returns a string it will be used as as the initial url and the initial state will be parsed from it (using the parseUrl function). 

### initializationTimeoutDuration: integer (ms) default 10 seconds

The duration in milliseconds to wait before timing out the initialisation function. Set to zero (or falsey in general) to disable the timeout.

### baseUrl: string default empty string ('')

This will be passed as basename to the history object. It represents the base part of the url of your site which will be prefixed for all urls.

### initialNoneUrlState: Object default empty object

The initial part of the state that is not stored in the url. Will be merged with the state parsed from the url initially to get the initialState. In most cases you will not need this. so keep it as the default.

### historyType: string default 'browser'

Can be set to either 'browser', 'hash', 'memory', or 'hash-maa' selects the underlying history create function to be used. note 'hash-maa' is inspired by [this comment](https://github.com/ReactTraining/history/issues/435#issuecomment-287849591), it uses internaly browser history but it abstracts this from the user.

## isInitialised(): Boolean

### @returns: Boolean

Returns whether or not the router is initialised.

## pushRouterState(newState[, locationState]): Promise<Object|Boolean>

a function that pushes a new state to the router and changes the url accordingly.

### newState: Object

The new state to push.

### locationState: Object

will be forwarded to history.push as the second argument. Mostly you wont need this so dont send it.

### @returns: Promise

Returns a promise that resolved to the new state if the navigation was not blocked, or a promise that resolves to explicitly false if the navigation was blocked.

## pushRouterStateThroughChange(change[, locationState]): Promise<Object|Boolean>

a function that pushes a change to the current the router state and changes the url accordingly. The change object is merged with the current state using the mergeRouterStateChangeFunction(which defaults to Object.assign).

### change: Object

The change object to merge with the current state.

### locationState: Object

will be forwarded to history.push as the second argument. Mostly you wont need this so dont send it.

### @returns: Promise

Returns a promise that resolved to the new state if the navigation was not blocked, or a promise that resolves to explicitly false if the navigation was blocked.

## replaceRouterState(newState[, locationState]): Promise<Object|Boolean>

Same as pushRouterState but replaces current state instead of pushing new one.

## replaceRouterStateThroughChange(change[, locationState]): Promise<Object|Boolean>

Same as pushRouterStateThroughChange but replaces current state instead of pushing new one.

## goInRouterStates(delta: integer)

Goes back or forward in router states.

### delta: integer

The change to move. -1 to go back one step, 1 to move forward one step. 0 will throw an error.

## getRouterState([delta: integer])

Returns the router state delta steps away (same concept of delta in goInRouterStates above). Not sending a delta or sending a zero as delta will return the current state, which is what is needed in most cases.

### delta: integer

-1 returns previous state, 1 returns next (forward) state. 0 or nothing will return the current state.

### @returns: Object|undefined

Returns a the state at delta offset from current or undefined if it doesnt exist.

## getRouterStateLocation(): integer

Returns current stateLocation

### @returns: integer

Returns current stateLocation same as the one sent to routerStateChangedHandler explained above.

## getRouterStateLength(): integer

Returns length of the states object.

### @returns: integer

Returns length of the states object. E.g. if you navigated 10 times this will be 10.

## pushTransitionAllowedCheckFunction(checkFunc, popOnceRouteAllowed = true, priority = 0, popCheckFunc = undefined): Function

pushes a transition allowed check function in order of priority.

### checkFunc: Function

A function to be called to check if transition is to be allowed or not returning true will immitiately allow transition returning false will immidiately block transition returning undefined (like dont care) will keep checking other check functions on the stack. note: this function can be async i.e. returning a promise that resolves to true, false or undefined has the same effect as above but will be awited for. Also note that by default when a route is allowed the function will be poped (removed from the check call stack), to disable this behaviour send popOnceRouteAllowed (the second argument) as false. This is done specifically like this cause most of the time you push a function for example at pageLoad/componentDidLoad to block transition if some changes have not been saved and once the user confirms or there is no changes anyways, you want the check function to be removed. NOTE: the check function will be called with one argument of the following format:
```
  {
    state,    // the current state
    newState, // the tentative next state
    action,   // 'POP', 'PUSH' or 'REPLACE' as in the [history](https://github.com/ReactTraining/history) package
    popMe     // a function if called will pop the check regardless if route is allowed or not
  }
```

### popOnceRouteAllowed: Boolean default true

If set to false will not remove the checkFunction when transition is allowed. See argument in checkFunc description above.

### priority: Number default 0

The priority of this check. Bigger priorities will be called first. I used this for example in the case of a form where you want to block the transition if there is unsaved changes but for some reason the server returns a 401 error and you need to redirect to login page. To do so here just add the 401 check with higher priority and only return true if the the nextState is for the login page and the action is not POP. NOTE: if two functions have same priority the last one added will be called first.

### popCheckFunc: function

Optional function to call once route is allowed to check whether to remove the check or not. NOTE: if popOnceRouteAllowed is set to true this function is useless
