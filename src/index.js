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
import { liftActions } from './utils';

// LIFT ACTIONS

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
