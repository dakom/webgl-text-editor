export const program = `
attribute vec2 a_Vertex;

varying vec2 v_TexCoord;

uniform mat4 u_Transform;
uniform mat4 u_Size;

void main() {     
    gl_Position = u_Transform * (u_Size * vec4(a_Vertex,0,1));
    v_TexCoord = a_Vertex;
}
`;