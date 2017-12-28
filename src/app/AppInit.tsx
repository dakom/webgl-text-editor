
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './App.css';
import {TextEditor} from "./components/Text-Editor/Text-Editor";
import {WebGlDisplay} from "./components/WebGl-Display/WebGl-Display";
import {getStateFromHtml} from "./utils/draft/Draft-Utils";

const initialEditorState = getStateFromHtml(`<b>Hello</b>, <i>בְּרֵאשִׁ֖ית</i><br/ ><br />`)
const eventListeners = [];

const MainPage = 
(
    <div className="flex flexRow flexStart">
        <TextEditor 
            editorState={initialEditorState}
            onEditorChanged={editorState => eventListeners.forEach(fn => fn(editorState))} 
            eventListeners={eventListeners} 
        />

        <WebGlDisplay 
            editorState={initialEditorState}
            eventListeners={eventListeners} 
        />
    </div>
);

ReactDOM.render(MainPage, document.getElementById('root'))
