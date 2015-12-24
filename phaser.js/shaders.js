var game = new Phaser.Game(512, 512, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('background', '../assets/basic.png');
    game.load.image('background_normal', '../assets/grassy_norm.png');
    game.load.image('wizard', '../assets/wizard.png');
    game.load.spritesheet('butterfly', '../assets/butterfly.png', 70, 50, 13);
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
        "uniform vec3 uLightPos[2];",
        "uniform vec4 uLightColor[2];",
        

        "void main(void) {",
            "vec2 swapped = vec2(vTextureCoord.x, -vTextureCoord.y);",
            "vec4 texColor = texture2D(uSampler, vTextureCoord);",
            "vec3 NormalMap = texture2D(uNormal, swapped).rgb;",
            "vec3 N = normalize(NormalMap * 2.0 - 1.0);",
            "vec4 AmbientColor = vec4(0.7, 0.7, 0.7, 0.4);",    //ambient RGBA -- alpha is intensity ",
            "vec3 Falloff = vec3(0.9, 0.7, 0.4);",    
            "vec3 Ambient = AmbientColor.rgb * AmbientColor.a;",
            "vec3 Intensity = Ambient;",
            "int i = 0;",
            "for(int i=0; i<2; i+=1) {",
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
    wizard = game.add.sprite(game.world.centerX, game.world.centerY, 'butterfly');
    wizard.anchor.setTo(0.5, 0.5);
    wizard.animations.add('walk');
    wizard.animations.play('walk', 35, true);
        
    var customUniforms = {
        uNormal: { type: 'sampler2D', value: normalmap, textureData: { repeat: true } },
        "uLightPos[0]": { type: '3f', value: {x: 0.3, y: 0.3, z: 0.04}},
        "uLightPos[1]": { type: '3f', value: {x: 0.8, y: 0.6, z: 0.05}},
////        "uLightPos[2]": { type: '3f', value: {x: 0.6, y: 0.5, z: 0.05}},
        "uLightColor[0]": { type: '4fv', value: [0.0, 1.0, 1.0, 0.5]},
        "uLightColor[1]": { type: '4fv', value: [1.0, 1.0, 0.0, 0.5]},
//        "uLightColor[2]": { type: '4fv', value: [0.2, 0.2, 1.0, 0.9]},
    };
    
//    for(var i = 0 ; i < 20; i++){
//        var position = { type: '3f', value: {
//            x: Math.random(),
//            y: Math.random(),
//            z: 0.006
//        }};
//                       
//        var color = { type: '4fv', value: [
//            Math.random() / 3.0 + 0.5,
//            Math.random() / 3.0 + 0.5,
//            Math.random() / 3.0 + 0.5,
//            Math.random() / 3.3 + 0.6
//        ]};
//        
//        customUniforms["uLightPos[" + i + "]"] = position;
//        customUniforms["uLightColor[" + i + "]"] = color;
//    }
//    
    
    
    
    filter = new Phaser.Filter(game, customUniforms, fragmentSrc);
    filter.setResolution(512, 512);
    
//    this.game.stage.filters = [filter];
    sprite.filters = [ filter ];
//    normal.visible = false;

}

function update() {

    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)
       || game.input.keyboard.isDown(Phaser.Keyboard.A))
    {
        wizard.x -= 3;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)
       || game.input.keyboard.isDown(Phaser.Keyboard.D))
    {
        wizard.x += 3;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)
       || game.input.keyboard.isDown(Phaser.Keyboard.W))
    {
        wizard.y -= 3;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)
       || game.input.keyboard.isDown(Phaser.Keyboard.S))
    {
        wizard.y += 3   ;
    }
    
    wizard.angle = 180.0 * Math.atan2(game.input.y-wizard.y, game.input.x-wizard.x) / Math.PI + 90;
    
    filter.uniforms["uLightPos[0]"].value = {x: (wizard.x/game.width).toFixed(2), y: (1 - wizard.y/game.height).toFixed(2), z: 0.08};
    filter.uniforms["uLightPos[1]"].value = {x: (game.input.x/game.width).toFixed(2), y: (1 - game.input.y/game.height).toFixed(2), z: 0.08};
//    filter.syncUniforms();
        
    filter.update(game.input.activePointer);

}
