export const promisifyFunctionCall = (fn, args = [], context = null) => {
  try {
    return Promise.resolve(fn.apply(context, args));
  }
  catch(err) {
    return Promise.reject(err);
  }
};

const binarySearch = (arr, lowI, highI, val, compFn) => {
  if(highI < lowI) {
    return -1;
  }
  const midI = Math.ceil((lowI + highI) / 2);
  const compRes = compFn(val, arr[midI]);
  if(compRes === 0) {
    return midI;
  }
  if(compRes > 0) {
    const ret = binarySearch(arr, (midI + 1), highI, val, compFn);
    if(ret === -1) {
      return midI + 1;
    }
    return ret;
  }
  else {
    const ret = binarySearch(arr, lowI, (midI -1), val, compFn);
    if(ret === -1) {
      return midI;
    }
    return ret;
  }
};

export const sortedInsert = (arr, val, compFn) => {
  let i = arr.length ? binarySearch(arr, 0, arr.length - 1, val, compFn) : 0;
  for(; i < arr.length && compFn(val, arr[i]) === 0; i++);
  arr.splice(i, 0, val);
  return arr;
};

export const ensurePathName = (pathname) => {
  return pathname || '/';
};

export const ensureSlashPrefix = (path) => {
  if(!path) {
    return '/';
  }
  if(path[0] !== '/') {
    return '/' + path;
  }
  return path;
};

export const trimSlashSuffix = (path) => {
  if(!path) {
    return '';
  }
  if(path[path.length - 1] === '/') {
    return path.substr(0, path.length - 1);
  }
  return path;
};
