import axios from 'axios'

export const LOADING_PRODUCTS = 'LOADING_PRODUCTS';
export const PRODUCTS_LOADED = 'PRODUCTS_LOADED';
export const ERROR_LOADING_PRODUCTS = 'ERROR_LOADING_PRODUCTS';
export const SHOW_CONFIRM_MODAL = 'SHOW_CONFIRM_MODAL';

export const loadProducts = () => {
  return function(dispatch, getState) {
    const { product } = getState();
    if(product.products) {
      return Promise.resolve(product.products);
    }
    if(product.productsLoadingPromise) {
      return product.productsLoadingPromise;
    }
    
    const productsLoadingPromise = axios.get('/api/products.json')
    .then((res) => {
      return res.data.products;
    });

    dispatch(loadingProducts(productsLoadingPromise));

    productsLoadingPromise
    .then((products) => {
      dispatch(productsLoaded(products));
      return products;
    })
    .catch((err) => {
      dispatch(errorLoadingProducts(err));
    });

    return productsLoadingPromise;
  };
};

export const loadingProducts = (loadingPromise) => ({
  type: LOADING_PRODUCTS,
  loadingPromise
});

export const productsLoaded = (products) => ({
  type: PRODUCTS_LOADED,
  products
});

export const errorLoadingProducts = (error) => ({
  type: ERROR_LOADING_PRODUCTS,
  error
});

export const showConfirmModal = (show) => ({
  type: SHOW_CONFIRM_MODAL,
  show: show !== false
});
