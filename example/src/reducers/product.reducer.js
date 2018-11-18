import { LOADING_PRODUCTS, PRODUCTS_LOADED, ERROR_LOADING_PRODUCTS, SHOW_CONFIRM_MODAL } from '../actions';
import _ from 'lodash';

const product = (state = {
  products: null,
  productsById: {},
  productsLoadingPromise: null,
  errorLoadingProducts: null,
  isConfirmModalShown: false
}, action) => {
  switch (action.type) {
    case PRODUCTS_LOADED:
      return _.assign({}, state, {
        products: action.products,
        productsById: _.keyBy(action.products, 'id'),
        productsLoadingPromise: null,
        errorLoadingProducts: null
      });
    case LOADING_PRODUCTS:
      return _.assign({}, state, {
        productsLoadingPromise: action.loadingPromise,
        errorLoadingProducts: null
      });
    case ERROR_LOADING_PRODUCTS:
      return _.assign({}, state, {
        productsLoadingPromise: null,
        errorLoadingProducts: action.error
      });
    case SHOW_CONFIRM_MODAL:
      return _.assign({}, state, {
        isConfirmModalShown: action.show
      });
    default:
      return state;
  }
}

export default product;
