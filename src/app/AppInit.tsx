
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './App.css';
import {S} from "./utils/sanctuary/Sanctuary"
import {TextEditor} from "./components/Text-Editor/Text-Editor";
import {WebGlDisplay} from "./components/WebGl-Display/WebGl-Display";
import {getStateFromHtml} from "./utils/draft/Draft-Utils";
import {EditorState, RichUtils} from "draft-js";

//const initialEditorState = getStateFromHtml(`<span style="font-weight: bold; font-size: 12; font-family: 'Arial'">Hello</span>, <span style="font-style: italic;">בְּרֵאשִׁ֖ית</span>`)
const initialEditorState = getStateFromHtml(`<b>Hello</b>, <i>בְּרֵאשִׁ֖ית</i>`);

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
