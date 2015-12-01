var game = new Phaser.Game(1024, 512, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('default', '../assets/grass.jpeg');
    game.load.image('default_normal', '../assets/moss_normal.jpg');
//    game.load.image('background', '../assets/grass2.jpeg');
//    game.load.image('background_normal', '../assets/grass2_norm.jpeg');
      game.load.image('background', '../assets/castle.png');
      game.load.image('background_normal', '../assets/sphere_norm.jpg');

}

var filter;
var sprite;
var normal;
var filterdef;
var spritedef;
var normaldef;

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
            "vec4 LightColor = vec4(1.0, 0.8, 0.0, 0.8);",
            "vec4 AmbientColor = vec4(0.7, 0.7, 0.7, 0.4);",    //ambient RGBA -- alpha is intensity ",
            "vec3 Falloff = vec3(0.7, 0.6, 0.3);",
        
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
    

//    normaldef = game.add.sprite(0, 0, 'default_normal'); 
    normaldef = game.add.renderTexture(512, 512, 'default_normal'); 
    spritedef = game.add.sprite(0, 0, 'default');
    normal = game.add.sprite(513, 0, 'background_normal'); 
    sprite = game.add.sprite(513, 0, 'background');
        
   
        
    var customUniforms = {
        uNormal: { type: 'sampler2D', value: normal.texture, textureData: { repeat: true } }
    };
    
    var customUniformsDef = {
        uNormal: { type: 'sampler2D', value: normaldef, textureData: { repeat: true } }
    };
    
    filter = new Phaser.Filter(game, customUniforms, fragmentSrc);
    filterdef = new Phaser.Filter(game, customUniformsDef, fragmentSrc);
    filter.setResolution(1024, 512);
    filterdef.setResolution(1024, 512);
    
//    this.game.stage.filters = [filter];
    sprite.filters = [ filter ];
    spritedef.filters = [ filterdef ];
//    normal.visible = false;

}

function update() {

    filter.update(game.input.activePointer);
    filterdef.update(game.input.activePointer);

}
