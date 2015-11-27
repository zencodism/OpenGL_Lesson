var game = new Phaser.Game(512, 512, Phaser.AUTO, 'phaser-example', { preload: preload, create: create });

function preload() {

    game.load.image('castle', '../assets/castle.png');
    game.load.image('castle_normal', '../assets/castle_normal.png');

}

var filter;
var sprite;
var normal;

function create() {

    var fragmentSrc = [

        "precision mediump float;",

        "varying vec2 vTextureCoord;",
//        "uniform vec2 mouse;",
//        "uniform vec2 resolution;",
        "uniform sampler2D uSampler;",
        "uniform sampler2D uNormal;",        

        "void main(void) {",
            "vec2 swapped = vec2(vTextureCoord.x, -vTextureCoord.y);",
            "vec4 texColor = texture2D(uSampler, vTextureCoord);",
            "vec4 nColor = texture2D(uNormal, swapped);",
            
        
            
            "gl_FragColor = texColor + nColor;",

        "}"
    ];
    
    var normal_light_frag_shader = [
        "precision mediump float;",
        
        "varying vec2 vTextureCoord;",

"        uniform sampler2D uSampler;",
"        uniform sampler2D uNormal;",

"        //values used for shading algorithm...",
"        uniform vec2 Resolution;      //resolution of screen",
"        uniform vec3 LightPos;        //light position, normalized",
"        uniform vec4 LightColor;      //light RGBA -- alpha is intensity",
"        uniform vec4 AmbientColor;    //ambient RGBA -- alpha is intensity ",
"        uniform vec3 Falloff;         //attenuation coefficients",

        
"        void main() {",
"            //RGBA of our diffuse color",
"            vec4 DiffuseColor = texture2D(u_texture, vTexCoord);",
            "vec4 vColor = DiffuseColor;",
            "vec2 swapped = vec2(vTextureCoord.x, -vTextureCoord.y);",

        
"            //RGB of our normal map",
            "vec3 NormalMap = texture2D(uNormal, swapped).rgb;",

        
"            //The delta position of light",
"            vec3 LightDir = vec3(LightPos.xy - (gl_FragCoord.xy / Resolution.xy), LightPos.z);",

        
"            //Correct for aspect ratio",
"            LightDir.x *= Resolution.x / Resolution.y;",

        
"            //Determine distance (used for attenuation) BEFORE we normalize our LightDir",
"            float D = length(LightDir);",

        
"            //normalize our vectors",
"            vec3 N = normalize(NormalMap * 2.0 - 1.0);",
"            vec3 L = normalize(LightDir);",

        
"            //Pre-multiply light color with intensity",
"            //Then perform 'N dot L' to determine our diffuse term",
"            vec3 Diffuse = (LightColor.rgb * LightColor.a) * max(dot(N, L), 0.0);",

        
"            //pre-multiply ambient color with intensity",
"            vec3 Ambient = AmbientColor.rgb * AmbientColor.a;",

        
"            //calculate attenuation",
"            float Attenuation = 1.0 / ( Falloff.x + (Falloff.y*D) + (Falloff.z*D*D) );",

        
"            //the calculation which brings it all together",
"            vec3 Intensity = Ambient + Diffuse * Attenuation;",
"            vec3 FinalColor = DiffuseColor.rgb * Intensity;",
"            gl_FragColor = vColor * vec4(FinalColor, DiffuseColor.a);",
"        }    ",
    
    ]

    normal = game.add.sprite(0, 0, 'castle_normal'); 
    sprite = game.add.sprite(0, 0, 'castle');
   
        
    var customUniforms = {
        uNormal: { type: 'sampler2D', value: normal.texture, textureData: { repeat: true } }
    };
    
    filter = new Phaser.Filter(game, customUniforms, fragmentSrc);

    sprite.filters = [ filter ];
//    normal.visible = false;

}
