import * as R from "ramda";
import {S} from "../utils/sanctuary/Sanctuary";
import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js';
import {mat4} from "gl-matrix";

const emptyPixel = Float32Array.from([0.0,0.0,0.0,0.0]);


interface TextureInfo {
    isTexture:boolean;
    data?:string;
    isReady?:boolean;
}

const getTransformMatrix = () => {

}

export type DrawArguments = {editorState:EditorState, transformMatrix:Float32Array};

export const makeDrawer = gl => program => {
    const uSize = gl.getUniformLocation(program, "u_Size");
    const uTransform = gl.getUniformLocation(program, "u_Transform");
    const uColor = gl.getUniformLocation(program, "u_Color");
    const aVertex = gl.getAttribLocation(program, "a_Vertex");
    const sizeMatrix = mat4.create();
    
    const vertexBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferId);
    gl.bufferData(
        gl.ARRAY_BUFFER, 
        Float32Array.from([
            0.0,1.0, // top-left
            0.0,0.0, //bottom-left
            1.0, 1.0, // top-right
            1.0, 0.0 // bottom-right
        ]), 
        gl.STATIC_DRAW
    );

    return ({editorState, transformMatrix}:DrawArguments) => {
        const width = 200;
        const height = 100;

        mat4.fromScaling(sizeMatrix, [width, height, 1]);

        gl.uniformMatrix4fv(uSize, false, sizeMatrix);
        gl.uniformMatrix4fv(uTransform, false, transformMatrix);

        gl.vertexAttribPointer(aVertex, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferId);
    
        gl.uniform4fv(uColor, Float32Array.from([0.0, 1.0, 0.0, 1.0]));

        console.log("drew color o_O");

/*
    if(isTexture) {
        io.output.webgl.switchTextureUrl(props.url) (gl.TEXTURE0);
        gl.uniform1i(uniform("u_Sampler"), 0);
        gl.uniform4fv(uniform("u_HitColor"), emptyPixel);
    } else {
        gl.uniform4fv(uniform("u_Color"), Float32Array.from(props.color));
    }
  */  
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}