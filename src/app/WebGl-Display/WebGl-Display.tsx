import * as R from 'ramda';
import * as React from 'react';
import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js';
import "./WebGl-Display.css";
import {CompileShader} from "../utils/webgl/WebGl-Shader";
import {program as texturedQuadVertex} from './shader-vertex';
import {program as texturedQuadFragment} from './shader-fragment';
import {makeDrawer, DrawArguments} from "./Draw";
import {mat4} from "gl-matrix";

//Main component
interface WebGlDisplayProps {
    editorState: EditorState;
    eventListeners: Array<(editorState:EditorState) => void>;
}

interface WebGlDisplayState {
    editorState: EditorState;
    transformMatrix: Float32Array;
}

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

    private draw:({editorState, transformMatrix}:DrawArguments) => void;

    constructor(props) {
        super(props);

        this.state = {
            editorState: props.editorState,
            transformMatrix: getTransformMatrix()
        }
     
        this.updateTexture = this.updateTexture.bind(this);

        this.props.eventListeners.push(editorState => 
            this.setState({
                editorState: editorState   
            })
        );
    }

    componentDidMount() {
        const canvasElement = this.canvasElement;

        const gl = (canvasElement.getContext("webgl") as WebGLRenderingContext) || (canvasElement.getContext("experimental-webgl") as WebGLRenderingContext);
        this.gl = gl;

        const program = CompileShader (gl) ({
            vertex: texturedQuadVertex,
            fragment: texturedQuadFragment
        });

        //Initial WebGL setup
        gl.clearColor(1,0,0,1);
        gl.useProgram(program);
        this.draw = makeDrawer (gl) (program);

        //Handle resize and first draw
        const onResize =  () => {
            const {width, height} = getCanvasSize();
            
            canvasElement.setAttribute('width', width.toString());
            canvasElement.setAttribute('height', height.toString());

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            this.setState({
                transformMatrix: getTransformMatrix()
            });
        }

        window.addEventListener("resize", onResize, false);

        //First draw
        onResize();
        this.updateTexture();
    }

    componentDidUpdate(prevProps, prevState) {
        this.updateTexture();
    }

    updateTexture() {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT);

        this.draw({
            editorState: this.state.editorState,
            transformMatrix: this.state.transformMatrix
        });
    }

    render() {
        return <canvas ref={el => this.canvasElement = el} className="canvas" />
    }
}