import { LOADING_PRODUCTS, PRODUCTS_LOADED, ERROR_LOADING_PRODUCTS } from '../actions';

const loader = (state = { isLoading: 0 }, action) => {
  switch (action.type) {
    case LOADING_PRODUCTS:
      return { isLoading: state.isLoading + 1 };
    case PRODUCTS_LOADED:
    case ERROR_LOADING_PRODUCTS:
      if(state.isLoading === 0) {
        throw new Error('isLoading 0 and trying to stop loading!');
      }
      return { isLoading: state.isLoading - 1 };
    default:
      return state;
  }
}

export default loader;
