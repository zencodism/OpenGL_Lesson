var game = new Phaser.Game(512, 512, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

//    game.load.image('background', '../assets/castle.png');
//    game.load.image('background_normal', '../assets/castle_normal.png');
    game.load.image('background', '../assets/ground.png');
    game.load.image('background_normal', '../assets/ground_normal.png');

}

var filter;
var sprite;
var normal;

function create() {

    var fragmentSrc = [

        "precision mediump float;",

        "varying vec2 vTextureCoord;",
        "uniform vec2 mouse;",
        "uniform vec2 resolution;",
        "uniform sampler2D uSampler;",
        "uniform sampler2D uNormal;",        

        "void main(void) {",
            "vec2 swapped = vec2(vTextureCoord.x, -vTextureCoord.y);",
            "vec4 texColor = texture2D(uSampler, vTextureCoord);",
            "vec4 nColor = texture2D(uNormal, swapped);",
            "vec2 p = gl_FragCoord.xy / resolution  - mouse;",
            "vec3 vLightPos = vec3(mouse.x, mouse.y, 0.08); //normalize(vec3(80.0, 40.0, 20.0));",          
            "vec3 LightDir = vec3(vLightPos.xy - (gl_FragCoord.xy / resolution.xy), vLightPos.z);",
            "vec4 LightColor = vec4(1.0, 0.8, 0.0, 1.0);",
            "vec4 AmbientColor = vec4(0.7, 0.7, 0.9, 0.4);",    //ambient RGBA -- alpha is intensity ",
            "vec3 Falloff = vec3(1.0, 1.0, 1.0);",
        
            "LightDir.x *= resolution.x / resolution.y;",

        
            "float D = length(LightDir);",

            "vec3 NormalMap = texture2D(uNormal, swapped).rgb;",
            "vec3 N = normalize(NormalMap * 2.0 - 1.0);",
            "vec3 L = normalize(LightDir);",
        
            "vec3 Diffuse = (LightColor.rgb * LightColor.a) * max(dot(N, L), 0.0);",
            "vec3 Ambient = AmbientColor.rgb * AmbientColor.a;",
            "float Attenuation = 1.0 / ( Falloff.x + (Falloff.y*D) + (Falloff.z*D*D) );",
            "vec3 Intensity = Ambient + Diffuse * Attenuation;",
            "vec3 FinalColor = texColor.rgb * Intensity;",
            
//            "if(mouse.x > 0.5)",
//            "{",
//                "FinalColor.g = 0.0;",
//            "}",
            "gl_FragColor = vec4(FinalColor, texColor.a);",
        
        "}"
    ];
    

    normal = game.add.sprite(0, 0, 'background_normal'); 
    sprite = game.add.sprite(0, 0, 'background');
   
        
    var customUniforms = {
        uNormal: { type: 'sampler2D', value: normal.texture, textureData: { repeat: true } }
    };
    
    filter = new Phaser.Filter(game, customUniforms, fragmentSrc);
    filter.setResolution(512, 512);
    
    sprite.filters = [ filter ];
//    normal.visible = false;

}

function update() {

    filter.update(game.input.activePointer);

}
