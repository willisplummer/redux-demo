import React from 'react';
import {
  reducer as counterReducer,
  Counter,
  initialState as counterInitialState
} from './counter';

export const initialState = {
  counter1: counterInitialState(),
  counter2: counterInitialState()
};

export const updateCounter1 = (subAction) => (
  { type: 'UPDATE_COUNTER_1', subAction }
);

export const updateCounter2 = (subAction) => (
  { type: 'UPDATE_COUNTER_2', subAction }
);

export const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_COUNTER_1':
      const counter1 = counterReducer(state.counter1, action.subAction)
      return { ...state, counter1 }
    case 'UPDATE_COUNTER_2':
      const counter2 = counterReducer(state.counter2, action.subAction)
      return { ...state, counter2 }
    default:
      return state
  }
};

export const Counters = ({ state, counter1Actions, counter2Actions }) => (
  <div>
    <h1>Counters:</h1>
    <Counter
      state={state.counter1}
      { ...counter1Actions }
    />
    <Counter
      state={state.counter2}
      { ...counter2Actions }
    />
  </div>
);
