export const program = `
precision mediump float;
uniform vec4 u_Color;
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;

void main() {
    if(u_Color.a == 0.0) {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    } else {
        gl_FragColor = u_Color;
    }
}
`;