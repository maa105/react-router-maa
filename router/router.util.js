export const promisifyFunctionCall = (fn, args = [], context = null) => {
  try {
    return Promise.resolve(fn.apply(context, args));
  }
  catch(err) {
    return Promise.reject(err);
  }
};
