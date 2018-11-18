import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import './index.css';
import App from './components/app/app.component';
import { changeRouterState, initRouter } from './actions';
import { initializeRouter } from 'react-router-maa';
import { parseUrl, toUrl } from './utils';
import thunkMiddleware from 'redux-thunk';
import '@fortawesome/fontawesome-free/css/all.css';

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

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
