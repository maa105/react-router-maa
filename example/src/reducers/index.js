import { combineReducers } from 'redux';
import routerReducer from './router.reducer';
import loaderReducer from './loader.reducer';
import productReducer from './product.reducer';

export default combineReducers({
  router: routerReducer,
  loader: loaderReducer,
  product: productReducer
});
