import * as React from 'react';
import { Editor, EditorState, RichUtils, ContentBlock, DraftHandleValue, Modifier } from 'draft-js';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import './Text-Editor.css';

const FontList = [
    "Times New Roman",
    "Arial",
    "Helvetica",
    "Comic Sans MS",
    "Impact",
    "Courier New",
    "Lucida Console",
    "serif",
    "sans-serif",
    "monospace"
].map(font => ({
    label: font,
    style: `fontFamily-${font}`
}));

const SizeList = [
    8,
    12,
    16,
    24,
    32,
    42,
    50,
    64,
    72,
    80,
    92,
    112,
    128
].map(size => ({
    label: size,
    style: `fontSize-${size}`
}));

const INLINE_STYLE_BUTTONS = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' }
];

const styleMap = Object.assign({},
    FontList.reduce((acc, font) => {
        acc[font.style] = {
            fontFamily: font.label
        }

        return acc;
    }, {}),
    SizeList.reduce((acc, size) => {
        acc[size.style] = {
            fontSize: size.label
        }

        return acc;
    }, {})
);

interface StyleButtonProps {
    onToggle: (style:any) => void;
}
class StyleButton extends React.Component<any, StyleButtonProps> {
    constructor(props) {
        super(props);
        this.onToggle = this.onToggle.bind(this);
    }

    onToggle(e) {
        e.preventDefault();
        this.props.onToggle(this.props.style);
    };

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



const InlineStyleControls = (props) => {
    var currentStyle = props.editorState.getCurrentInlineStyle();

    let selectedFont = currentStyle.find((value, key) => value.indexOf("fontFamily-") === 0);
    let selectedSize = currentStyle.find((value, key) => value.indexOf("fontSize-") === 0);
    
    //It seems the default draft fromHtml uses something like this... unavoidable for now
    if(selectedFont === undefined) {
        selectedFont = "fontFamily-serif";
    }

    if(selectedSize === undefined) {
        selectedSize = "fontSize-16";
    }

    return (
        <div className="RichEditor-controls">
            <div className="flex flexCenter flexContentStart flexRow">
            {INLINE_STYLE_BUTTONS.map(type =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}

            <Select
                className="RichEditor-controls-fontSelect"
                clearable={false}
                autosize={false}
                value={selectedFont}
                onChange={selectedOption => props.onChangeFont(selectedOption.value)}
                options={FontList.map(font => ({value: font.style, label: font.label}))}
            />

            <Select
                className="RichEditor-controls-sizeSelect"
                clearable={false}
                autosize={false}
                value={selectedSize}
                onChange={selectedOption => props.onChangeSize(selectedOption.value)}
                options={SizeList.map(size => ({value: size.style, label: size.label}))}
            />
            </div>
        </div>
    );
};


const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();

    return (
      <div className="RichEditor-controls">
        
      </div>
    );
  };

//Main component
interface TextEditorProps {
    editorState: EditorState;
    onEditorChanged: (editorState: EditorState) => void;
    eventListeners: Array<(editorState: EditorState) => void>;
}

export class TextEditor extends React.Component<TextEditorProps, any> {
    private focus: () => void;
    private onChange: (editorState: EditorState) => void;

    private editor: Editor;
    constructor(props) {
        super(props);

        this.state = {
            editorState: props.editorState
        }

        this.props.eventListeners.push(editorState =>
            this.setState({
                editorState: editorState
            })
        );

        this.focus = () => this.editor.focus();
        this.onChange = this.props.onEditorChanged;
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.onTab = this.onTab.bind(this);
        this.toggleBlockType = this.toggleBlockType.bind(this);
        this.toggleInlineStyle = this.toggleInlineStyle.bind(this);
        this.changeFont = this.changeFont.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    handleKeyCommand(command, editorState):DraftHandleValue {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    onTab(e) {
        const maxDepth = 4;
        this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
    }

    toggleBlockType(blockType) {
        console.log(blockType);

        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    changeFont(value) {
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        const currentStyle = editorState.getCurrentInlineStyle();

        const nextContentState = 
            currentStyle.reduce((contentState, style) => 
                (style.indexOf("fontFamily-") === 0)
                    ?   Modifier.removeInlineStyle(contentState, selection, style)
                    :   contentState
                , editorState.getCurrentContent());
        
        let nextEditorState = EditorState.push(
          editorState,
          nextContentState,
          'change-inline-style'
        );

        

        // Unset style override... not sure what this does actually but it's from the color example
        if (selection.isCollapsed()) {
            nextEditorState = 
                currentStyle.reduce((state, style) => {
                    return RichUtils.toggleInlineStyle(state, style);
                }, nextEditorState);
        }

        // If the value exists, set it
        if (!currentStyle.has(value)) {
          nextEditorState = RichUtils.toggleInlineStyle(
            nextEditorState,
            value
          );
        }

        this.onChange(nextEditorState);
    }

    changeSize(value) {
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        const currentStyle = editorState.getCurrentInlineStyle();

        const nextContentState = 
            currentStyle.reduce((contentState, style) => 
                (style.indexOf("fontSize-") === 0)
                    ?   Modifier.removeInlineStyle(contentState, selection, style)
                    :   contentState
                , editorState.getCurrentContent());
        
        let nextEditorState = EditorState.push(
          editorState,
          nextContentState,
          'change-inline-style'
        );

        

        // Unset style override... not sure what this does actually but it's from the color example
        if (selection.isCollapsed()) {
            nextEditorState = 
                currentStyle.reduce((state, style) => {
                    return RichUtils.toggleInlineStyle(state, style);
                }, nextEditorState);
        }

        // If the value exists, set it
        if (!currentStyle.has(value)) {
          nextEditorState = RichUtils.toggleInlineStyle(
            nextEditorState,
            value
          );
        }

        this.onChange(nextEditorState);
    }
    
    render() {
        const { editorState } = this.state;

        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        const contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }

        return (
            <div className="RichEditor-container RichEditor-root">
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                    onChangeFont={this.changeFont}
                    onChangeSize={this.changeSize}
                />
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                />
                <div className={className} onClick={this.focus}>
                    <Editor
                        customStyleMap={styleMap}
                        editorState={editorState}
                        onChange={this.onChange}
                        placeholder="Tell a story..."
                        handleKeyCommand={this.handleKeyCommand}
                        onTab={this.onTab}
                        ref={editor => this.editor = editor}
                        spellCheck={true}
                    />
                </div>
            </div>
        )
    }
}

