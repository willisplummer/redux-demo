import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';

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

// MIDDLEWARE

const createLogger = ({ getState }) => {
  return (next) =>
    (action) => {
      const console = window.console;
      const prevState = getState();
      const returnValue = next(action);
      const nextState = getState();
      const actionType = String(action.type);
      const message = `action ${actionType}`;
      console.log(`%c prev state`, `color: #9E9E9E`, prevState);
      console.log(`%c action`, `color: #03A9F4`, action);
      console.log(`%c next state`, `color: #4CAF50`, nextState);
      return returnValue;
    };
}

// INIT

const store = createStore(update, 0, applyMiddleware(createLogger));
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
