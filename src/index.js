import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';

// UPDATE

const update = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    case 'RESET':
      return state = 0;
    default:
      return state;
  }
};

// VIEW

const Counter = ({ value, onIncrement, onDecrement, onReset }) => (
  <div>
    <p>Count: {value}</p>
    <button onClick={onIncrement}>+</button>
    <button onClick={onDecrement}>-</button>
    <button onClick={onReset}>reset</button>
  </div>
);

// INIT

const store = createStore(update, 0);
const rootEl = document.getElementById('root');

const render = () => {
  ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
      onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
      onReset={() => store.dispatch({ type: 'RESET' })}
    />,
    rootEl
  );
};

render();
store.subscribe(render);
