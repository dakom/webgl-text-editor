const isPowerOf2 = (value:number):boolean => (value & (value - 1)) == 0;

export interface TextureOptions {
    alpha: boolean;
    mips: boolean;
}

export const makeTextureFactory = (gl:WebGLRenderingContext) => (options:TextureOptions) => (target: HTMLImageElement | HTMLCanvasElement): WebGLTexture => {
    const {alpha, mips} = options;

    const format = (alpha) ? gl.RGBA : gl.RGB;
    const texture = gl.createTexture();
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    

    //https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
    if (isPowerOf2(target.width) && isPowerOf2(target.height) && mips) {
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, target);
    return texture;
}