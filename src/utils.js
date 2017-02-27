const mapObject = (fn, obj) =>
  Object.keys(obj)
    .reduce((newObj, key) => (
      { ...newObj, [key]: fn(obj[key]) }
      ), {});

const compose = (...functions) =>
  functions.reduce((f, g) => (...xs) => f(g(...xs)));

export const liftActions = (store, higherOrderActionCreator, xs) =>
  mapObject(x => compose(store.dispatch, higherOrderActionCreator, x), xs);
