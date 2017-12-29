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

    blocksFromHTML.contentBlocks.forEach(block => block.getInlineStyleAt(2).forEach(style => {
        console.log(style);

    }));
    
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
        let fontSize = 16;
        

        block.findStyleRanges(() => true, (start, end) => {
            const str = text.substring(start, end);
            isRtl = stringIsRtl(str);

            let font = {
                style: 'normal',
                variant: 'normal',
                weight: 'normal',
                family: 'serif',
            }

            block.getInlineStyleAt(start).forEach(style => {
                if(style.indexOf("fontFamily-") === 0) {
                    font.family = style.substring(11); //strip off the prefix
                } else if(style.indexOf("fontSize-") === 0) {
                    fontSize = parseInt(style.substring(9), 10); //strip off the prefix
                } else {
                    switch(style) {
                        case "ITALIC": font.style = 'italic'; break;
                        case "BOLD": font.weight = 'bold'; break;
                        default: console.log(style);
                    }
                }
            });

            ctx.font = `${font.style} ${font.variant} ${font.weight} ${fontSize}px ${font.family}`;
            textWidth = ctx.measureText(str).width;

            if(pos.x === null) {
                //should actually be based on alignment settings...
                pos.x = 0;
            }
            if(pos.y === null) {
                pos.y = fontSize;
            }
            
            ctx.fillText(str, pos.x, pos.y);
            
            pos.x += isRtl ? (textWidth * -1) : textWidth;
        });

        pos.y += fontSize * 1.2;
        pos.x = null;
    });
  
    
    
    
    return canvasElement
}