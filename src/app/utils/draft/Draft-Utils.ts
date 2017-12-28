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
        let fontSize = 48;
        

        block.findStyleRanges(() => true, (start, end) => {
            const str = text.substring(start, end);
            isRtl = stringIsRtl(str);

            let font = {
                style: 'normal',
                variant: 'normal',
                weight: 'normal',
                family: 'Times New Roman',
            }

            block.getInlineStyleAt(start).forEach(style => {
                switch(style) {
                    case "ITALIC": font.style = 'italic'; break;
                    case "BOLD": font.weight = 'bold'; break;
                    default: console.log(style);
                }
            });

            ctx.font = `${font.style} ${font.variant} ${font.weight} ${fontSize}px ${font.family}`;
            textWidth = ctx.measureText(str).width;

            if(pos.x === null) {
                pos.x = isRtl ? (canvasElement.width - textWidth) : 0;
            }
            if(pos.y === null) {
                pos.y = fontSize;
            }
            
            ctx.fillText(str, pos.x, pos.y);
            
            pos.x += isRtl ? (textWidth * -1) : textWidth;
        });

        pos.y += fontSize;
        pos.x = null;
    });
  
    
    
    
    return canvasElement
}