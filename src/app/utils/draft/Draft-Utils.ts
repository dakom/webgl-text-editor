import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js';
import {stringIsRtl} from "../text/Text-Utils";

export const getRaw = editorState =>
    convertToRaw(editorState.getCurrentContent());

export const getStateFromHtml = htmlString => {
    const blocksFromHTML = convertFromHTML(htmlString);
    const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
    );

    return EditorState.createWithContent(contentState);
}

export const getCanvasFromEditor = (editorState:EditorState):HTMLCanvasElement => {
    const canvasElement = document.createElement('canvas');
        canvasElement.width = window.innerWidth/2;
        canvasElement.height = window.innerHeight;
        canvasElement.dir="rtl";
    const ctx = canvasElement.getContext('2d');
    const content = editorState.getCurrentContent();

    let pos = {
        x: null, //needs to be determined based on whether text is ltr or rtl
        y: null //positioning this at 0 puts the text _above_ the canvas
    }

    content.getBlockMap().map(block => {
        const text = block.getText();
        let isRtl:boolean;
        let textWidth:number;

        let font = {
            style: 'normal',
            variant: 'normal',
            weight: 'normal',
            size: 48,
            family: 'Times New Roman',
        }

        block.findStyleRanges(() => true, (start, end) => {
            const str = text.substring(start, end);
            isRtl = stringIsRtl(str);

            block.getInlineStyleAt(start).forEach(style => {
                switch(style) {
                    case "ITALIC": font.style = 'italic'; break;
                    case "BOLD": font.weight = 'bold'; break;
                    default: console.log(style);
                }
            });

            ctx.font = `${font.style} ${font.variant} ${font.weight} ${font.size}px ${font.family}`;
            textWidth = ctx.measureText(str).width;

            if(pos.x === null) {
                pos.x = isRtl ? (canvasElement.width - textWidth) : 0;
            }
            if(pos.y === null) {
                pos.y = font.size;
            }
            
            ctx.fillText(str, pos.x, pos.y);
            
            pos.x += isRtl ? (textWidth * -1) : textWidth;
        });

        pos.y += font.size;
        pos.x = null;
    });
  
    
    
    
    return canvasElement
}