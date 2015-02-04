import cocos

vert_shader = """
//1
attribute vec4 a_position;
attribute vec2 a_texCoord;
 
//2
uniform mat4 u_MVPMatrix;
 
//3
#ifdef GL_ES
varying mediump vec2 v_texCoord;
#else
varying vec2 v_texCoord;
#endif
 
//4
void main()
{
//5
  gl_Position = u_MVPMatrix * a_position;
//6
  v_texCoord = a_texCoord;
}
"""

frag_shader = """
varying lowp vec4 v_fragmentColor;
varying lowp vec2 v_texCoord;
uniform sampler2D u_texture;

float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(92.,80.))) +
                 cos(dot(co.xy ,vec2(41.,62.))) * 5.1);
}

void main()
{
    vec2 rnd = vec2(0.0);
    rnd = vec2(rand(v_texCoord),rand(v_texCoord));
    glFragColor = texture2D(u_texture, v_texCoord+rnd*0.05);
}
"""
from cocos.shader import ShaderProgram
ShaderProgram.simple_program("frost", vert_shader, frag_shader)

class Zen(cocos.layer.Layer):
    def __init__(self):
        super(Zen, self).__init__()
        sprite = cocos.sprite.Sprite("pebbleconcrete.jpg")
        sprite.position = (100, 100)
        self.add(sprite)
        
cocos.director.director.init(width=1024, height=768)
layer = Zen()
scene = cocos.scene.Scene(layer)
cocos.director.director.run(scene)