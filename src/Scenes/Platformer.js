class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 700;
        this.DRAG = 2500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1400;
        this.JUMP_VELOCITY = -500;
        this.DASH_VELOCITY = 400;
        this.TOP_VELOCITY = 200;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.PARTICLE_JUMP_TIMER = 7;
        this.ParticleJumpCntr = 0;
        this.DASHCOOLDOWN = 60;
        this.DashCooldownCntr = 0;
        this.Dashing = false;
        this.DASHLENGTH = 20;
        this.DashLengthCntr = 0;
        this.bounceNoise = false;
        this.bounceLeftNoise = false;
        this.bounceRightNoise = false;
        this.bounceUpNoise = false;
        //console.log(this);
        
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-2", 18, 18, 120, 120);
        
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.tileset2 = this.map.addTilesetImage("kenney_tilemap_backgrounds_packed", "tilemap_tilesbg");

        // Create a layer
        this.backbackdropLayer = this.map.createLayer("Backbackground",this.tileset2, 0, 0);
     
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.backdropLayer = this.map.createLayer("Background",this.tileset, 0, 0);
        this.title = this.add.text(0, 200, 'Pathless Traveled', { font: '120px',color: 1 });
        this.playText = this.add.text(167, 5, 'Play', { font: '25px',color:1 });
        this.playText = this.add.text(500, 50, 'Space\nbar', { font: '25px',color:1 });
        this.playText = this.add.text(500, 105, 'Arrow\n Keys', { font: '25px',color:1 });
        this.playText = this.add.text(50, 450, 'Spacebar', { font: '25px',color:1 });
        this.playText = this.add.text(50, 405, 'Arrow Keys', { font: '25px',color:1 });
        this.playText = this.add.text(1030, 5, 'Again?', { font: '20px',color:1 });
        //this.playText = this.add.text(167, 5, 'Play', { font: ' 30px Times',color:1 });
        //this.backdropLayer.setTint(0x00ff00);
        //this.backdropLayer.setTint(0xff0000);
        //console.log(this.backdropLayer);
   //this.backdrop.setScale(this.SCALE);
        // TODO: Add createFromObjects here
        
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 157
        });
        // TODO: Add turn into Arcade Physics here
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.bounds.setTo(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        this.spikes = this.map.createFromObjects("Spikes", {
            name: "spike",
            key: "tilemap_sheet",
            frame: 68
        });
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.spikeGroup = this.add.group(this.spikes);


        this.bounces = this.map.createFromObjects("Bounces", {
            name: "bounce",
            key: "tilemap_sheet",
            frame: 158
        });
        this.physics.world.enable(this.bounces, Phaser.Physics.Arcade.STATIC_BODY);
        this.bounceGroup = this.add.group(this.bounces);


        this.starts = this.map.createFromObjects("Starts", {
            name: "start",
            key: "tilemap_sheet",
            frame: 158
        });
        this.physics.world.enable(this.starts, Phaser.Physics.Arcade.STATIC_BODY);
        this.startGroup = this.add.group(this.starts);

        this.ends = this.map.createFromObjects("Ends", {
            name: "end",
            key: "tilemap_sheet",
            frame: 111
        });
        this.physics.world.enable(this.ends, Phaser.Physics.Arcade.STATIC_BODY);
        this.endGroup = this.add.group(this.ends);
        //this.animatedTiles.init(this.map);
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(200, 50, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setBounceX(0);
        my.sprite.player.setBounceY(0);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.backdropLayer);
        // TODO: Add coin collision handler
        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            if(obj2.visible == true){
                this.sound.play("chip",{
                    volume: 0.2
                });
            }
            obj2.visible = false; // remove coin on overlap

        });
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            this.resetGame();
        });
        this.physics.add.overlap(my.sprite.player, this.startGroup, (obj1, obj2) => {
            if(this.Dashing == true){
                my.sprite.player.x = 50;
                my.sprite.player.y = this.map.heightInPixels-100;
            }
        });
        this.physics.add.overlap(my.sprite.player, this.bounceGroup, (obj1, obj2) => {
            if(this.Dashing == true){
                obj2.visible = false;
                if(obj2.visible == true){
                    this.sound.play("chip",{
                        volume: 0.2
                    });
                }
            }
        });
        this.physics.add.overlap(my.sprite.player, this.endGroup, (obj1, obj2) => {
            //if(this.Dashing == true){
                my.sprite.player.x = 1050;
                my.sprite.player.y = this.map.heightInPixels-550;
            //}
        });
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // movement vfx
        this.colorarray = [ 0xfacc22, 0xf89800, 0xf83600, 0x9f0404 ];
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png', 'smoke_09.png'],
            random: true,
            speed:{min:1, max: 5},
            scale: {start: 0.03, end: 0.05},
            maxAliveParticles: 2,
            lifespan: 200,
            gravityY: -200,
            alpha: {start: 0.5, end: 0.1}, 
            frequency: 15
        });
        my.vfx.dashing = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_01.png','circle_02.png'],
            random: true,
            speed:{min:1, max: 5},
            scale: {start: 0.03, end: 0.01},
            maxAliveParticles: 1000,
            lifespan: 400,
            gravityY: 0,
            alpha: {start: 0.4, end: 0.1}, 
            //color: this.colorarray,
            frequency:0.8,
            colorEase: 'quad.out',
            //blendMode: 'ADD'
        });
        
        my.vfx.dashing.stop();

        my.vfx.walking.stop();

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        //console.log(this.map.widthInPixels);
        //console.log(this.map.heightInPixels);
    }

    update() {
        this.decrementCounters();
        this.checkDashing();
        if(my.sprite.player.body.velocity.x < -this.TOP_VELOCITY && this.Dashing == false){
            my.sprite.player.body.setVelocityX(-this.TOP_VELOCITY);
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
        }
        if(my.sprite.player.body.velocity.x > this.TOP_VELOCITY && this.Dashing == false){
            //console.log("Contained!");
            my.sprite.player.body.setVelocityX(this.TOP_VELOCITY);
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
        }
        if(my.sprite.player.body.velocity.x < -this.TOP_VELOCITY && this.Dashing == false){
            //console.log("Contained!");
            my.sprite.player.body.setVelocityX(-this.TOP_VELOCITY);
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
        }
        /*
        if(my.sprite.player.body.velocity.x > 600){
            console.log("SUPER CONTAIN");
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setVelocityX(0);
            
        }
        if(my.sprite.player.body.velocity.x < -600){
            console.log("SUPER CONTAIN");
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setVelocityX(0);
            
        }
        if( my.sprite.player.body.velocity.y > this.TOP_VELOCITY * 4){
            console.log("Contained!");
            my.sprite.player.body.setVelocityY(this.TOP_VELOCITY * 4);
            my.sprite.player.setAccelerationY(0);
        }
        */
        if(cursors.left.isDown) {
            //console.log(my.sprite.player.body.velocity.x);
            my.sprite.player.setAccelerationX(-this.ACCELERATION);

            my.sprite.player.resetFlip();
            if(this.Dashing == false ){
            my.sprite.player.anims.play('walk', true);
            }

            
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            //console.log(my.sprite.player);
            if (my.sprite.player.body.blocked.down) {
                this.ParticleJumpCntr = this.PARTICLE_JUMP_TIMER;
                my.vfx.walking.start();

            }
            else{
                this.ParticleJumpCntr--;
                //console.log();
                if( this.ParticleJumpCntr <= 0){
                    my.vfx.walking.stop();
                }
            }
            if (my.sprite.player.body.blocked.left) {
                my.vfx.walking.stop();
            }
            if (Phaser.Input.Keyboard.JustDown(cursors.space) && this.DashCooldownCntr <= 0){
                if(cursors.down.isDown){
                    this.dashDownLeft();
                    //console.log("BOING");
                }
                else{
                    this.dashLeft();
                    //console.log("NEURM");
                }

            }


        } else if(cursors.right.isDown) {
            //console.log(my.sprite.player.body.velocity.x);
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            if(this.Dashing == false){
            my.sprite.player.anims.play('walk', true);
            }
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {
                this.ParticleJumpCntr = this.PARTICLE_JUMP_TIMER;
                my.vfx.walking.start();

            }
            
            else{
                this.ParticleJumpCntr--;
                //console.log();
                if( this.ParticleJumpCntr <= 0){
                    my.vfx.walking.stop();
                }
            }
            if (my.sprite.player.body.blocked.right) {
                my.vfx.walking.stop();
            }
            if (Phaser.Input.Keyboard.JustDown(cursors.space) && this.DashCooldownCntr <= 0){
                if(cursors.down.isDown){
                    this.dashDownRight();
                    //console.log("BOING");
                }
                else{
                    this.dashRight();
                    //console.log("NEURM");
                }

            }
        }else if(cursors.down.isDown){
            my.vfx.walking.stop();
            my.sprite.player.setAccelerationX(0);
            if(Phaser.Input.Keyboard.JustDown(cursors.space) && this.DashCooldownCntr <= 0){
                this.dashDown();
                //console.log("BOING");
            }

        }
         else {
            // Set acceleration to 0 and have DRAG take over
            if(this.Dashing == false){
                my.sprite.player.setAccelerationX(0);
                my.sprite.player.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
                my.vfx.walking.stop();
                if(Phaser.Input.Keyboard.JustDown(cursors.space) && this.DashCooldownCntr <= 0){
                    if(my.sprite.player.flipX == true){
                        this.dashRight();
                        //console.log("BOING");
                    }
                    else{
                        this.dashLeft();
                        //console.log("BOING");
                    }
    
                }
            }

            // TODO: have the vfx stop playing
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down && this.Dashing == false) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            //this.scene.restart();
            this.resetGame();
        }
    }
    decrementCounters(){
        this.DashCooldownCntr--;
        this.DashLengthCntr--;
    }
    resetGame(){
        // variables and settings
        this.sound.play("gameover",{
            volume: 0.5
        });
        this.ACCELERATION = 700;
        this.DRAG = 2500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1400;
        this.JUMP_VELOCITY = -500;
        this.DASH_VELOCITY = 400;
        this.TOP_VELOCITY = 200;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.PARTICLE_JUMP_TIMER = 7;
        this.ParticleJumpCntr = 0;
        this.DASHCOOLDOWN = 50;
        this.DashCooldownCntr = 0;
        this.Dashing = false;
        this.DASHLENGTH = 20;
        this.DashLengthCntr = 0;
        this.bounceNoise = false;
        this.bounceLeftNoise = false;
        this.bounceRightNoise = false;
        this.bounceUpNoise = false;
        //console.log(this);
        
        for (let coin of this.coinGroup.children.entries){
            coin.visible = true;
        }
        for (let bounce of this.bounceGroup.children.entries){
            bounce.visible = true;
        }
        my.sprite.player.x = 50;
        my.sprite.player.y = this.map.heightInPixels-100;
    }
    checkDashing(){
        if(this.DashLengthCntr <= 0){
            //console.log("DASHOFF");
            this.Dashing = false;
            my.sprite.player.setBounceX(0);
            my.sprite.player.setBounceY(0);
            my.vfx.dashing.stop();
            this.bounceNoise = false;
            this.bounceLeftNoise = false;
            this.bounceRightNoise = false;
            this.bounceUpNoise = false;
        }
        if(this.DashLengthCntr > 1 && this.DashLengthCntr < 20){
            if(my.sprite.player.body.blocked.down && this.bounceNoise == false){
                this.sound.play("afterThump",{
                    volume: 0.1
                });
                this.bounceNoise = true;
            }
            if(my.sprite.player.body.blocked.left && this.bounceLeftNoise == false){
                this.sound.play("afterThump",{
                    volume: 0.1
                });
                this.bounceLeftNoise = true;
            }
            if(my.sprite.player.body.blocked.right && this.bounceRightNoise == false){
                this.sound.play("afterThump",{
                    volume: 0.1
                });
                this.bounceRightNoise = true;
            }
            if(my.sprite.player.body.blocked.up && this.bounceUpNoise == false){
                this.sound.play("afterThump",{
                    volume: 0.1
                });
                this.bounceUpNoise = true;
            }
            my.sprite.player.setAccelerationX(0);
            //console.log("AHGHGH")            
        }
        if(this.DashLengthCntr == 1){
            //this.sound.play("afterThump2",{
            //    volume: 0.2 
            //});
            //console.log(this.bounceNoise)
        }
    }
    dashLeft(){
        //let my = this.my;

        if(!my.sprite.player.body.blocked.left){
            this.sound.play("thump",{
                volume: 0.8 
            });
            my.vfx.dashing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2 + 10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.dashing.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.dashing.start();
            this.Dashing = true;
            this.DashLengthCntr = this.DASHLENGTH;
            this.DashCooldownCntr = this.DASHCOOLDOWN;
            //my.sprite.player.setDragX(0);
            my.sprite.player.setBounceX(1);
            my.sprite.player.anims.play('dash');
            my.sprite.player.body.setVelocityX(-this.DASH_VELOCITY);
            //my.sprite.player.body.setAccelerationX(0);
            //my.sprite.player.body.setAccelerationY(0);
            //my.sprite.player.setDragX(this.DRAG*10);
            //my.sprite.player.setDragY(this.DRAG);
        }

    }
    dashRight(){

        if(!my.sprite.player.body.blocked.right){
            this.sound.play("thump",{
                volume: 0.8 
            });
            my.vfx.dashing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2 - 10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.dashing.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            my.vfx.dashing.start();
            this.Dashing = true;
            this.DashLengthCntr = this.DASHLENGTH;
            this.DashCooldownCntr = this.DASHCOOLDOWN;
            my.sprite.player.setBounceX(1);
            my.sprite.player.anims.play('dash');
            my.sprite.player.body.setVelocityX(this.DASH_VELOCITY);
        }
    }
    dashDownRight(){
        if(!my.sprite.player.body.blocked.right && !my.sprite.player.body.blocked.down){
            this.sound.play("thump",{
                volume: 0.8 
            });
            my.vfx.dashing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2 - 10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.dashing.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            my.vfx.dashing.start();
            this.Dashing = true;
            this.DashLengthCntr = this.DASHLENGTH;
            this.DashCooldownCntr = this.DASHCOOLDOWN;
            my.sprite.player.setBounceX(0.85);
            my.sprite.player.setBounceY(0.85);
            my.sprite.player.anims.play('dash');
            my.sprite.player.body.setVelocityX(this.DASH_VELOCITY);
            my.sprite.player.body.setVelocityY(this.DASH_VELOCITY);
        }
    }
    dashDownLeft(){
        if(!my.sprite.player.body.blocked.left && !my.sprite.player.body.blocked.down){
            this.sound.play("thump",{
                volume: 0.8 
            });
            my.vfx.dashing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2+ 10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.dashing.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.dashing.start();
            this.Dashing = true;
            this.DashLengthCntr = this.DASHLENGTH;
            this.DashCooldownCntr = this.DASHCOOLDOWN;
            my.sprite.player.setBounceX(0.85);
            my.sprite.player.setBounceY(0.85);
            my.sprite.player.anims.play('dash');
            my.sprite.player.body.setVelocityX(-this.DASH_VELOCITY);
            my.sprite.player.body.setVelocityY(this.DASH_VELOCITY);
        }
    }
    dashDown(){
        if(!my.sprite.player.body.blocked.left && !my.sprite.player.body.blocked.down){
            this.sound.play("thump",{
                volume: 0.8 
            });
            my.vfx.dashing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5, false);
            my.vfx.dashing.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.dashing.start();
            //console.log(my.sprite.player);
            this.Dashing = true;
            this.DashLengthCntr = this.DASHLENGTH;
            this.DashCooldownCntr = this.DASHCOOLDOWN;
            //my.sprite.player.setBounceX(0.7);
            my.sprite.player.setBounceY(1);
            my.sprite.player.anims.play('dash');
            //my.sprite.player.body.setVelocityX(-this.DASH_VELOCITY);
            my.sprite.player.body.setVelocityY(this.DASH_VELOCITY);
        }
    }
}