import * as R from 'ramda';
import * as React from 'react';
import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js';
import "./WebGl-Display.css";
import {getCanvasFromEditor} from "../../utils/draft/Draft-Utils";
import {CompileShader} from "../../utils/webgl/WebGl-Shader";
import {makeTextureFactory} from "../../utils/webgl/WebGl-Texture";
import {program as texturedQuadVertex} from './shader-vertex';
import {program as texturedQuadFragment} from './shader-fragment';
import {makeRenderer, RenderData} from "./Renderer";
import {mat4} from "gl-matrix";

//Main component
interface WebGlDisplayProps {
    editorState: EditorState;
    eventListeners: Array<(editorState:EditorState) => void>;
}

type WebGlDisplayState = RenderData;


const getCanvasSize = ():{width:number, height:number} => {
    //might want to get these from the actual canvas element?
    return {
        width: window.innerWidth/2, 
        height: window.innerHeight
    }
}

const getTransformMatrix = ():Float32Array => {
    const {width, height} = getCanvasSize();

    const projection = mat4.ortho(mat4.create(), 0, width, 0, height, 0, 1) as any;
    const eye = mat4.create();
    const camera = mat4.multiply(mat4.create(), projection, eye);

    const world = mat4.fromTranslation(mat4.create(), [width/2, height/2, 0]);

    return mat4.multiply(mat4.create(), camera, world);

}


export class WebGlDisplay extends React.Component<WebGlDisplayProps, WebGlDisplayState> {
    private gl:WebGLRenderingContext;
    private canvasElement:HTMLCanvasElement;

    private renderShader:(renderData:RenderData) => void;

    constructor(props) {
        super(props);

        this.state = {
            texture: null,
            transformMatrix: getTransformMatrix()
        }
    }

    componentDidMount() {
        //context and element setup
        const canvasElement = this.canvasElement;

        const gl = (canvasElement.getContext("webgl") as WebGLRenderingContext) || (canvasElement.getContext("experimental-webgl") as WebGLRenderingContext);
        this.gl = gl;

        //Initial WebGL setup
        const program = CompileShader (gl) ({
            vertex: texturedQuadVertex,
            fragment: texturedQuadFragment
        });

        gl.clearColor(1,0,0,1);
        gl.useProgram(program);
        this.renderShader = makeRenderer (gl) (program);
        const textureFactory = makeTextureFactory (gl) ({alpha: true, mips: false});

        //Utility functions
        const createTexture = editorState => 
            textureFactory(getCanvasFromEditor(editorState));

        const resize = ():Float32Array => {
            const {width, height} = getCanvasSize();
            
            canvasElement.setAttribute('width', width.toString());
            canvasElement.setAttribute('height', height.toString());

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            return getTransformMatrix()
        }

        //Event handlers
        this.props.eventListeners.push(editorState => 
            this.setState({
                texture: createTexture(editorState)
            })
        );

        window.addEventListener(
            "resize", 
            evt => this.setState({
                transformMatrix: resize()
            }), 
            false
        );

        //First draw
        this.setState({
            transformMatrix: resize(),
            texture: createTexture(this.props.editorState)
        });
    }

    componentDidUpdate(prevProps, prevState) {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT);

        this.renderShader({
            transformMatrix: this.state.transformMatrix,
            texture: this.state.texture
        });
    }

    render() {
        return <canvas ref={el => this.canvasElement = el} className="canvas" />
    }
}