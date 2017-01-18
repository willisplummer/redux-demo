import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Editor, EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';

// UPDATE

const update = (state = 0, action) => {
  switch (action.type) {
    case 'EDITOR_CHANGE':
      console.log(action.editorState);
      return { count: state.count, editorState: action.editorState };
    default:
      return state;
  }
};

// VIEW

const Main = ({ state, onIncrement, onDecrement }) => {
  const { editorState } = state
  return(
    <div>
      <MyEditor content={editorState} />
    </div>
  )
}

const createDebouncer = (fn, ms) => {
  let timeout;
  return (...xs) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => fn(...xs), ms);
  }
};

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    let editorState;
    if (this.props.content.trim() !== '') {
      editorState = EditorState.createWithContent(stateFromHTML(this.props.content));
    } else {
      editorState = EditorState.createEmpty();
    }
    this.state = {editorState: editorState};
    const updateStore = createDebouncer((editorState) => store.dispatch({
      type: 'EDITOR_CHANGE',
      editorState: stateToHTML(editorState.getCurrentContent())
    }), 1000)
    this.onChange = (editorState) => {
      updateStore(editorState)
      this.setState({editorState})
    };
  }
  render() {
    return (
      <Editor editorState={this.state.editorState} onChange={this.onChange} />
    );
  }
}

// INIT

const initialData = `<p>testtestsetestest</p>
<p><br></p>
<p>hehe</p>
<p>hh</p>
<p><br></p>
<p><br></p>
<p>hahah</p>`
const store = createStore(update, { editorState: initialData });
const rootEl = document.getElementById('root');

const render = () => {
  ReactDOM.render(
    <Main
      state={store.getState()}
    />,
    rootEl
  );
};

render();
store.subscribe(render);
