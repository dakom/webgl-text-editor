import {S,Maybe, Either} from "../sanctuary/Sanctuary";

export const CompileShader = (gl: WebGLRenderingContext) => (source:{ vertex:string; fragment:string}): WebGLProgram => {
    
    const loadSource = (gl: WebGLRenderingContext) => (shaderType: number) => (sourceText: string): Either<WebGLShader | Error> => {
        const shader = gl.createShader(shaderType);
        gl.shaderSource(shader, sourceText);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const errorMessage = 'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            return S.Left(new Error(errorMessage));
        }

        return S.Right(shader);
    }

    const loadShader = (shaderType: number) => (sourceText: string) => (shaderProgram:WebGLProgram) => S.chain(
        shader => {
            gl.attachShader(shaderProgram,shader); 
            return S.Right(shaderProgram);
        },
        loadSource(gl)(shaderType)(sourceText)
    );

    
    const linkShader = (shaderProgram:WebGLProgram) => {
        gl.linkProgram(shaderProgram)
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            const errorMessage = 'Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram);
            gl.deleteProgram(shaderProgram);
            return S.Left(new Error(errorMessage));
        }

        return S.Right(shaderProgram);
    }

   
    const eitherShader:Either<WebGLProgram | Error> = S.pipe([
        S.chain(loadShader(gl.VERTEX_SHADER) (source.vertex)),
        S.chain(loadShader(gl.FRAGMENT_SHADER) (source.fragment)), 
        S.chain(linkShader),
    ])(S.Right(gl.createProgram()));

    if(eitherShader.isLeft) {
        //blow things up
        throw eitherShader.value;
    } else {
        return eitherShader.value;
    }
    
}

