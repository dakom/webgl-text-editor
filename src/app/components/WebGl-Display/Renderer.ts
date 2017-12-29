import * as R from "ramda";
import {S} from "../../utils/sanctuary/Sanctuary";
import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js';
import {mat4} from "gl-matrix";

interface TextureInfo {
    isTexture:boolean;
    data?:string;
    isReady?:boolean;
}

export interface RenderData {
    transformMatrix:Float32Array,
    texture:WebGLTexture,
    width: number,
    height:number
};

export const makeRenderer = gl => program => {
    const uSize = gl.getUniformLocation(program, "u_Size");
    const uTransform = gl.getUniformLocation(program, "u_Transform");
    const uColor = gl.getUniformLocation(program, "u_Color");
    const uSampler = gl.getUniformLocation(program, "u_Sampler");
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

    return (renderData:RenderData) => {
        const {texture, transformMatrix, width, height} = renderData;

        //console.log(width, height);
        
        //Set the scaling matrix based on world dimensions
        mat4.fromScaling(sizeMatrix, [width, height, 1]);

        //Assign the uniforms
        gl.uniformMatrix4fv(uSize, false, sizeMatrix);
        gl.uniformMatrix4fv(uTransform, false, transformMatrix);

        //Assign the geometry
        gl.vertexAttribPointer(aVertex, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferId);
    
        //just make it a solid color, for testing
        //gl.uniform4fv(uColor, Float32Array.from([0.0, 1.0, 0.0, 1.0]));

        //Assign the texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uSampler, 0);
        
        //Render!
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}