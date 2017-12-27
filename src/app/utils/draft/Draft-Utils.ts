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