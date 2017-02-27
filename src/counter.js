import React from 'react';

// MODEL

export const counterInitialState = {
  count: 0
} 

// UPDATE

const onIncrement = () => ({ type: 'INCREMENT' });
const onDecrement = () => ({ type: 'DECREMENT' });
const onReset = () => ({ type: 'RESET' });

export const reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    default:
      return state;
  }
};

// VIEW

export const counterActions = {
  onIncrement: onIncrement,
  onDecrement: onDecrement,
  onReset: onReset,
}

export const Counter = ({ state, onIncrement, onDecrement, onReset }) => (
  <div>
    <p>Count: {state.count}</p>
    <button onClick={onIncrement}>+</button>
    <button onClick={onDecrement}>-</button>
    <button onClick={onReset}>reset</button>
  </div>
);
