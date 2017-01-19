import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { CompositeDecorator, Editor, EditorState, Entity, RichUtils } from 'draft-js';
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

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);

    let editorState;
    if (this.props.content.trim() !== '') {
      editorState = EditorState.createWithContent(stateFromHTML(this.props.content), decorator);
    } else {
      editorState = EditorState.createEmpty(decorator);
    }

    this.state = {
      editorState: editorState,
      showURLInput: false,
      urlValue: ''
    };

    const updateStore = createDebouncer((editorState) => store.dispatch({
      type: 'EDITOR_CHANGE',
      editorState: stateToHTML(editorState.getCurrentContent())
    }), 500)

    this.onChange = (editorState) => {
      updateStore(editorState)
      this.setState({editorState})
    };
    this.onURLChange = (e) => this.setState({ urlValue: e.target.value });

    this.confirmLink = this._confirmLink.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }


  handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  _onBoldClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  }
  _onItalicClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
  }
  _onUnderlineClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'));
  }

  _confirmLink(e) {
    e.preventDefault();
    const {editorState, urlValue} = this.state;
    const entityKey = Entity.create('LINK', 'MUTABLE', {url: urlValue});
    this.setState({
      editorState: RichUtils.toggleLink(
        editorState,
        editorState.getSelection(),
        entityKey
      ),
      showURLInput: false,
      urlValue: '',
    });
  }

  _promptForLink(e) {
    e.preventDefault();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        showURLInput: true,
        urlValue: '',
      });
    }
  }

  render() {
    let urlInput;
    if (this.state.showURLInput) {
      urlInput =
        <div>
          <input
            onChange={this.onURLChange}
            ref="url"
            type="text"
            value={this.state.urlValue}
          />
          <button onClick={this.confirmLink}>
            Confirm
          </button>
        </div>;
    }

    return (
      <div>
        <button onClick={this._onBoldClick.bind(this)}>Bold</button>
        <button onClick={this._onItalicClick.bind(this)}>Italic</button>
        <button onClick={this._onUnderlineClick.bind(this)}>Underline</button>
        <button onClick={this._promptForLink.bind(this)}>Add Link</button>
        { urlInput }
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          handleKeyCommand={this.handleKeyCommand}
        />
      </div>
    );
  }
}

function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

const linkStyle = {
          color: '#3b5998',
          textDecoration: 'underline',
        }

const Link = (props) => {
  const {url} = Entity.get(props.entityKey).getData();
  return (
    <a href={url} style={linkStyle}>
      {props.children}
    </a>
  );
};

// INIT

const initialData = `<p>testtestsetestest</p>
<p><br></p>
<p>hehe</p>
<p>hh</p>
<p><br></p>
<p><br></p>
<p><a href='https://www.kickstarter.com'>hahah</a></p>`
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
