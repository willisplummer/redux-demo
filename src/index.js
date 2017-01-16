import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Editor, EditorState } from 'draft-js';

// UPDATE

const update = (state = 0, action) => {
  switch (action.type) {
    case 'EDITOR_CHANGE':
      console.log('editor change');
      return { count: state.count, editorState: action.editorState };
    case 'INCREMENT':
      return { state, ...{ count: state.count + 1 }};
    case 'DECREMENT':
      return { state, ...{ count: state.count - 1 }};
    default:
      return state;
  }
};

// VIEW

const Main = ({ state, onIncrement, onDecrement, onEditorChange }) => {
  const { count, editorState } = state
  return(
    <div>
      <Counter { ...{ count, onIncrement, onDecrement } } />
      <Editor onChange={onEditorChange} { ...{ editorState } } />
    </div>
  )
}

const Counter = ({ count, onIncrement, onDecrement }) => (
  <div>
    <p>Count: {count}</p>
    <button onClick={onIncrement}>+</button>
    <button onClick={onDecrement}>-</button>
  </div>
);

// INIT

const store = createStore(update, { count: 0, editorState: EditorState.createEmpty()});
const rootEl = document.getElementById('root');

const render = () => {
  ReactDOM.render(
    <Main
      state={store.getState()}
      onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
      onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
      onEditorChange={(editorState) => store.dispatch({ type: 'EDITOR_CHANGE', editorState: editorState})}
    />,
    rootEl
  );
};

render();
store.subscribe(render);
