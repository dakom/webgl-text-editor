import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js';

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

    /*
    content.getBlockMap().map(block => {
        const text = block.getText();

        const ranges = [];
        
        block.findStyleRanges(() => true, (start, end) => {
            console.log(start, end);
        })
    });
    */
    
    const blocks = 
        content.getBlockMap()
            .map(block => {
                const text = block.getText();
                return block
                    .getCharacterList()
                    .map(cMeta => cMeta.getStyle())
                    .map((styles, index) => ({
                        char: text.charAt(index),
                        styles: styles
                    }));
            });

    let pos = {
        x: 0,
        y: canvasElement.height/2 //positioning this at 0 puts the text _above_ the canvas for some reason
    }

    blocks.forEach(blockChars => {
        blockChars.forEach(({char, styles}) => {
            let font = {
                style: 'normal',
                variant: 'normal',
                weight: 'normal',
                size: '48px',
                family: 'sans-serif',
            }

            styles.forEach(style => {
                switch(style) {
                    case "ITALIC": font.style = 'italic'; break;
                    case "BOLD": font.weight = 'bold'; break;
                    default: console.log(style);
                }
            })
            
            ctx.font = `${font.style} ${font.variant} ${font.weight} ${font.size} ${font.family}`;
            ctx.fillText(char, pos.x, pos.y);
            pos.x += ctx.measureText(char).width;
        });
    })
    
    return canvasElement
}