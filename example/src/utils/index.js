import { ID_LENGTH } from '../constants';

export const parseUrl = (url) => {
  const urlSegments = url.trim().replace(/\\/gmi, '/').split('/');
  if(urlSegments[0] === '') {
    urlSegments.shift();
  }
  var routeData = {};

  if(urlSegments.length === 0) {
    routeData.isRoot = true;
    routeData.invalid = true;
    routeData.redirect = { page: 'home' };
    return routeData;
  }

  const seg0Lower = urlSegments[0].toLowerCase();
  switch(seg0Lower) {
    case 'home':
    case 'about':
    case 'products':
      routeData.page = seg0Lower;
      break;
    default:
      routeData.invalid = true;
      routeData.redirect = { page: 'home' };
      return routeData;
  }

  if(urlSegments.length === 1) {
    return routeData;
  }
  else if(routeData.page !== 'products') {
    routeData.invalid = true;
    routeData.redirect = { page: routeData.page };
    return routeData;
  }

  const seg1Lower = urlSegments[1].toLowerCase();
  if(seg1Lower.length < ID_LENGTH) {
    routeData.invalid = true;
    routeData.redirect = { page: routeData.page };
    return routeData;
  }

  routeData.productId = urlSegments[1].substr(urlSegments[1].length - ID_LENGTH);
  routeData.productName = urlSegments[1].substr(0, urlSegments[1].length - ID_LENGTH - 1);

  if(urlSegments.length === 2) {
    return routeData;
  }

  const seg2Lower = urlSegments[2].toLowerCase();
  switch(seg2Lower) {
    case 'details':
    case 'images':
      routeData.section = seg2Lower;
      break;
    default:
      routeData.invalid = true;
      routeData.redirect = { page: routeData.page, productName: routeData.productName, productId: routeData.productId };
      return routeData;
  }

  if(urlSegments.length === 3) {
    return routeData;
  }

  routeData.invalid = true;
  routeData.redirect = { page: routeData.page, productName: routeData.productName, productId: routeData.productId, section: routeData.section };
  return routeData;
};

export const toUrl = (routeData) => {
  let url = '/';
  if(routeData.page) {
    url += routeData.page;
  }
  else {
    return url;
  }

  if(routeData.page === 'products' && routeData.productId) {
    url += '/' + (routeData.productName ? routeData.productName.replace(/\s/gmi,'_') : 'product') + '-' + routeData.productId;
    if(routeData.section) {
      url += '/' + routeData.section;
    }
  }
  return url;
};
