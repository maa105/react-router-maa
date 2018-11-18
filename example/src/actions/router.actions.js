import _ from 'lodash'
import { loadProducts } from './product.actions'

export const CHANGE_ROUTER_STATE = 'CHANGE_ROUTER_STATE';

export const initRouter = (initialState, resolve) => {
  return function(dispatch, getState) {
    if(initialState.productId) {
      loadProducts()(dispatch, getState)
      .then((products) => {
        const product = _.find(products, (product) => product.id === initialState.productId);
        if(product) {
          if(initialState.redirect) {
            resolve(Object.assign({}, initialState.redirect, { productName: product.name }));
          }
          else if (initialState.productName !== product.name) {
            resolve(Object.assign({}, initialState, { productName: product.name }));
          }
          else {
            resolve();
          }
        }
        else {
          resolve('/products');
        }
      })
      .catch(() => {
        if(initialState.redirect) {
          resolve(initialState.redirect);
        }
        else {
          resolve('/products');
        }
      });
    }
    else {
      resolve(initialState.redirect);
    }
  };
};

export const changeRouterState = (state, position, isInit) => ({
  type: CHANGE_ROUTER_STATE,
  state,
  position,
  isInit
});
