import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

export const getRaw = editorState =>
    convertToRaw(editorState.getCurrentContent());

export const getMarkup = editorState =>
    draftToHtml(
        getRaw(editorState), 
        undefined, 
        true
    );


export const getStateFromHtml = htmlString => {
    const blocksFromHTML = convertFromHTML(htmlString);
    const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
    );

    return EditorState.createWithContent(contentState);
}

export const getCanvasFromEditor = (editorState:EditorState):HTMLCanvasElement => {
    const canvasElement =  document.createElement('canvas');
    const ctx = canvasElement.getContext('2d');

    //Just for testing, assign a random color and set size
    const rgb = {r: Math.floor(Math.random() * 0xFF), g: Math.floor(Math.random() * 0xFF), b: Math.floor(Math.random() * 0xFF)};
    ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    ctx.fillRect(0,0,300,200);

    return canvasElement;
}