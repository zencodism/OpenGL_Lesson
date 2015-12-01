var game = new Phaser.Game(512, 512, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
      game.load.image('background', '../assets/grass.jpeg');
      game.load.image('background_normal', '../assets/grass2_norm.jpeg');
      game.load.image('wizard', '../assets/wizard.png');
}

var filter;
var sprite;
var normal;
var filterdef;
var spritedef;
var normaldef;
var wizard;

function create() {

    var fragmentSrc = [

        "precision mediump float;",

        "varying vec2 vTextureCoord;",
        "uniform vec2 mouse;",
        "uniform vec2 resolution;",
        "uniform sampler2D uSampler;",
        "uniform sampler2D uNormal;",
        "uniform int uLightCnt;",
        "uniform vec3 uLightPos[3];",
        "uniform vec4 uLightColor[3];",
        

        "void main(void) {",
            "vec2 swapped = vec2(vTextureCoord.x, -vTextureCoord.y);",
            "vec4 texColor = texture2D(uSampler, vTextureCoord);",
            "vec3 NormalMap = texture2D(uNormal, swapped).rgb;",
            "vec3 N = normalize(NormalMap * 2.0 - 1.0);",
            "vec4 AmbientColor = vec4(0.7, 0.7, 0.7, 0.4);",    //ambient RGBA -- alpha is intensity ",
            "vec3 Falloff = vec3(0.7, 0.6, 0.3);",    
            "vec3 Ambient = AmbientColor.rgb * AmbientColor.a;",
            "vec3 Intensity = Ambient;",
            "int i = 0;",
            "for(int i=0; i<1; i+=1) {",
                "vec3 vLightPos = uLightPos[i];",//vec3(mouse.x, mouse.y, 0.08); //normalize(vec3(80.0, 40.0, 20.0));",          
                "vec3 LightDir = vec3(vLightPos.xy - (gl_FragCoord.xy / resolution.xy), vLightPos.z);",
                "vec4 LightColor = uLightColor[i];",//vec4(1.0, 0.8, 0.0, 0.8);",

                "LightDir.x *= resolution.x / resolution.y;",
                "float D = length(LightDir);",
                "vec3 L = normalize(LightDir);",

                "vec3 Diffuse = (LightColor.rgb * LightColor.a) * max(dot(N, L), 0.0);",

                "float Attenuation = 1.0 / ( Falloff.x + (Falloff.y*D) + (Falloff.z*D*D) );",

                "Intensity += Diffuse * Attenuation;",
            "}",
        
            "vec3 FinalColor = texColor.rgb * Intensity;",
            
//            "if(FinalColor.x == 0.0)",
//            "{",
//                "FinalColor.g = 0.5;",
//            "}",
            "gl_FragColor = vec4(FinalColor, texColor.a);",
        
        "}"
    ];
    

//    normal = game.add.sprite(0, 0, 'background_normal'); 
    normal = game.make.image(0, 0, 'background_normal');
    normalmap = game.add.renderTexture(512, 512, 'normalmap');
    normalmap.renderXY(normal, 0, 0, true);
    sprite = game.add.image(0, 0, 'background');
    wizard = game.add.sprite(game.world.centerX, game.world.centerY, 'wizard');
    wizard.anchor.setTo(0.5, 0.5);
        
    var customUniforms = {
        uNormal: { type: 'sampler2D', value: normalmap, textureData: { repeat: true } },
        uLightCnt: { type: '1i', value: 3},
        "uLightPos[0]": { type: '3f', value: {x: 0.3, y: 0.3, z: 0.08}},
//        "uLightPos[1]": { type: '3f', value: {x: 0.8, y: 0.6, z: 0.05}},
//        "uLightPos[2]": { type: '3f', value: {x: 0.6, y: 0.5, z: 0.05}},
        "uLightColor[0]": { type: '4fv', value: [1.0, 0.2, 0.2, 0.9]},
//        "uLightColor[1]": { type: '4fv', value: [0.2, 1.0, 0.2, 0.9]},
//        "uLightColor[2]": { type: '4fv', value: [0.2, 0.2, 1.0, 0.9]},
    };
    
    filter = new Phaser.Filter(game, customUniforms, fragmentSrc);
    filter.setResolution(512, 512);
    
//    this.game.stage.filters = [filter];
    sprite.filters = [ filter ];
//    normal.visible = false;

}

function update() {

    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
        wizard.x -= 3;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {
        wizard.x += 3;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
    {
        wizard.y -= 3;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
    {
        wizard.y += 3;
    }
    filter.uniforms["uLightPos[0]"].value = {x: (wizard.x/game.width).toFixed(2), y: (1 - wizard.y/game.height).toFixed(2), z: 0.2};
//    filter.syncUniforms();
        
    filter.update(game.input.activePointer);

}
