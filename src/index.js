import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { CompositeDecorator, convertToRaw, Editor, EditorState, Entity, RichUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';
import ReactPlayer from 'react-player'

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
      {
        strategy: findImageEntities,
        component: Image,
      },
      {
        strategy: findMediaEntities,
        component: Media,
      }
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
      urlValue: '',
      imgSrc: '',
      showImgInput: false,
      mediaSrc: '',
      showMediaInput: false
    };

    const updateStore = createDebouncer((editorState) => store.dispatch({
      type: 'EDITOR_CHANGE',
      editorState: stateToHTML(editorState.getCurrentContent())
    }), 500)

    this.onChange = (editorState) => {
      this.setState({editorState})
      updateStore(editorState)
    };

    this.logState = () => {
      const content = this.state.editorState.getCurrentContent();
      console.log(convertToRaw(content));
    };

    this.onURLChange = (e) => this.setState({ urlValue: e.target.value });
    this.confirmLink = this._confirmLink.bind(this);
    this.promptForLink = this._promptForLink.bind(this)
    this.onLinkInputKeyDown = this._onLinkInputKeyDown.bind(this);

    this.onImgChange = (e) => this.setState({ imgSrc: e.target.value });
    this.confirmImg = this._confirmImg.bind(this);
    this.promptForImgSrc = this._promptForImgSrc.bind(this);
    this.onImgInputKeyDown = this._onImgInputKeyDown.bind(this);

    this.onMediaChange = (e) => this.setState({ mediaSrc: e.target.value });
    this.confirmMedia = this._confirmMedia.bind(this);
    this.promptForMediaSrc = this._promptForMediaSrc.bind(this);
    this.onMediaInputKeyDown = this._onMediaInputKeyDown.bind(this);


    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.removeLink = this._removeLink.bind(this);
    this.onTab = (e) => this._onTab(e);
    this.toggleInlineStyle = (type) => this._toggleInlineStyle(type);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
  }

  handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }


// not working as expected (nothing happens) :thinking_face:
  _onTab(e) {
    e.preventDefault();
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
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

  _confirmImg(e) {
    e.preventDefault();
    const {editorState, imgSrc} = this.state;
    const entityKey = Entity.create('IMAGE', 'IMMUTABLE', {src: imgSrc});
    this.setState({
      editorState: RichUtils.toggleLink(
        editorState,
        editorState.getSelection(),
        entityKey
      ),
      showImgInput: false,
      imgSrc: '',
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

  _promptForImgSrc(e) {
    e.preventDefault();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        showImgInput: true,
        imgSrc: '',
      });
    }
  }

  _onImgInputKeyDown(e) {
    if (e.which === 13) {
      this._confirmImg(e);
    }
  }

  _onLinkInputKeyDown(e) {
    if (e.which === 13) {
      this._confirmLink(e);
    }
  }

  _removeLink(e) {
    e.preventDefault();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        editorState: RichUtils.toggleLink(editorState, selection, null),
      });
    }
  }

  _promptForMediaSrc(e) {
    e.preventDefault();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        showMediaInput: true,
        mediaSrc: '',
      });
    }
  }

  _onMediaInputKeyDown(e) {
    if (e.which === 13) {
      this._confirmImg(e);
    }
  }

  _confirmMedia(e) {
    e.preventDefault();
    const {editorState, mediaSrc} = this.state;
    const entityKey = Entity.create('MEDIA', 'IMMUTABLE', {url: mediaSrc});
    this.setState({
      editorState: RichUtils.toggleLink(
        editorState,
        editorState.getSelection(),
        entityKey
      ),
      showMediaInput: false,
      mediaSrc: '',
    });
  }

  render() {
    const {editorState} = this.state
    let urlInput;
    if (this.state.showURLInput) {
      urlInput =
        <div>
          <input
            onChange={this.onURLChange}
            onKeyPress={this.onLinkInputKeyDown}
            ref="url"
            type="text"
            value={this.state.urlValue}
          />
          <button onClick={this.confirmLink}>
            Confirm
          </button>
        </div>;
    }

    let imgInput;
    if (this.state.showImgInput) {
      imgInput =
        <div>
          <input
            onChange={this.onImgChange}
            onKeyPress={this.onImgInputKeyDown}
            ref="url"
            type="text"
            value={this.state.imgSrc}
          />
          <button onClick={this.confirmImg}>
            Confirm
          </button>
        </div>;
    }

    let mediaInput;
    if (this.state.showMediaInput) {
      mediaInput =
        <div>
          <input
            onChange={this.onMediaChange}
            onKeyPress={this.onMediaInputKeyDown}
            ref="url"
            type="text"
            value={this.state.mediaSrc}
          />
          <button onClick={this.confirmMedia}>
            Confirm
          </button>
        </div>;
    }

    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div>
        <button onClick={this.logState}>log state</button>
        <InlineStyleControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
        />
        <BlockStyleControls
          editorState={editorState}
          onToggle={this.toggleBlockType}
        />
        <button onClick={this.promptForLink}>Add Link</button>
        <button onClick={this.removeLink}>Remove Link</button>
        <br/>
        <button onClick={this.promptForImgSrc}>Add Img</button>
        <br/>
        <button onClick={this.promptForMediaSrc}>Add Vid</button>
        { urlInput }
        { imgInput }
        { mediaInput }
        <Editor
          blockStyleFn={getBlockStyle}
          customStyleMap={styleMap}
          editorState={editorState}
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.onChange}
          onTab={this.onTab}
          placeholder='say something dude'
          ref="editor"
          spellCheck={true}
        />
      </div>
    );
  }
}

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'H3', style: 'header-three'},
  {label: 'H4', style: 'header-four'},
  {label: 'H5', style: 'header-five'},
  {label: 'H6', style: 'header-six'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

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

function findImageEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'IMAGE'
      );
    },
    callback
  );
}

function findMediaEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'MEDIA'
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

const Image = (props) => {
  const {src} = Entity.get(props.entityKey).getData();
  return (
    <img src={src} />
  );
};

const Media = (props) => {
  const {url} = Entity.get(props.entityKey).getData();
  return (
    <ReactPlayer url={url} playing/>
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
