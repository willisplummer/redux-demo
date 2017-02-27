import React from 'react';
import ReactDOM from 'react-dom';
import {
  createStore
} from 'redux';
import {
  counterActions
} from './counter';
import {
  updateCounter1,
  updateCounter2,
  initialState,
  reducer,
  Counters
} from './counters';

// LIFT ACTIONS

const mapObject = (fn, obj) =>
  Object.keys(obj)
    .reduce((newObj, key) => (
      { ...newObj, [key]: fn(obj[key]) }
      ), {});

const compose = (...functions) =>
  functions.reduce((f, g) => (...xs) => f(g(...xs)));

const liftActions = (store, higherOrderActionCreator, xs) =>
  mapObject(x => compose(store.dispatch, higherOrderActionCreator, x), xs);


const store = createStore(reducer, initialState);
const counter1Actions = liftActions(store, updateCounter1, counterActions);
const counter2Actions = liftActions(store, updateCounter2, counterActions);

// INIT
console.log(store.getState())
const rootEl = document.getElementById('root');

const render = () => {
  ReactDOM.render(
    <Counters
      state={store.getState()}
      counter1Actions={counter1Actions}
      counter2Actions={counter2Actions}
    />,
    rootEl
  );
};

render();
store.subscribe(render);
