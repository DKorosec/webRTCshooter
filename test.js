function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


function render_crosshair() {

    var x = GameEngine.MousePos.x;
    var y = GameEngine.MousePos.y;
    var len = 15;
    var len2 = len / 2;
    var thik = 5;
    var thik2 = thik / 2;

    var padd = 0.2;

    context.fillStyle = "black";
    context.fillRect(x - len, y - thik2, len * (1 - padd), thik);
    context.fillRect(len * padd + x, y - thik2, len * (1 - padd), thik);

    context.fillRect(x - thik2, y - len, thik, len * (1 - padd));
    context.fillRect(x - thik2, y + len * padd, thik, len * (1 - padd));


    len = 13;
    len2 = len / 2;
    thik = 2;
    thik2 = thik / 2;

    var padd = 0.3;

    context.fillStyle = GameEngine.localPlayer.bodyColor;

    context.fillRect(x - len, y - thik2, len * (1 - padd), thik);
    context.fillRect(len * padd + x, y - thik2, len * (1 - padd), thik);

    context.fillRect(x - thik2, y - len, thik, len * (1 - padd));
    context.fillRect(x - thik2, y + len * padd, thik, len * (1 - padd));
}

function render_sniper_lasers() {
    for (let pid in GameEngine.players) {
        let player = GameEngine.players[pid];
        if (player.gun.TYPE == SniperGun.TYPE && !player.isDead()) {
            var startRay = player.getPlayerFireOutputPosition();

            //da lepo sledi, ker screen lahko hitreje refresha in se playerov cursor cudno potem vidi! + pazi ce si znotraj playera ker te cudno renda crte od lasera
            let cursor_condition = player.ID == GameEngine.localPlayer.ID && startRay.distance(GameEngine.MousePos) > player.bodyRadius * 2 && GameEngine.MousePos.distance(player.position) > player.bodyRadius * 2;
            var cursor_direction = cursor_condition ? startRay.vecTo(GameEngine.MousePos) : player.direction;

            var endRay = startRay.add(cursor_direction.scale(GameEngine.GEOMETRY_MAX_SAFE_VAL));
            var ray_rel = startRay.vecTo(endRay);
            var min_distance = GameEngine.GEOMETRY_MAX_SAFE_VAL;
            var min_cross = null;
            for (let wall of GameEngine.walls) {
                var crosses = wall.getIntersections(startRay, endRay);
                for (let cross of crosses) {
                    var dist = startRay.distance(cross);

                    if (dist < min_distance) {
                        min_distance = dist;
                        min_cross = cross;
                    }
                }
            }
            for (let p2 in GameEngine.players) {
                let oplayer = GameEngine.players[p2];
                if (oplayer.ID == player.ID)
                    continue;
                var crosses = oplayer.getIntersections(startRay, endRay);
                for (let cross of crosses) {
                    if (startRay.vecTo(cross).dot(ray_rel) < 0)
                        continue; //za sabo je najdo... ker ni segment algorithm ampak premica! 
                    var dist = startRay.distance(cross);
                    if (dist < min_distance) {
                        min_distance = dist;
                        min_cross = cross;
                    }
                }
            }

            if (min_cross == null)
                continue;

            context.beginPath();
            context.lineWidth = 0.5;
            context.strokeStyle = "red";
            context.moveTo(...startRay);
            context.lineTo(...min_cross);
            context.stroke();
        }
    }
}


function begin_render() {

    if (GameEngine.localPlayer) {

        context.clearRect(0, 0, GameEngine.MapDim.width, GameEngine.MapDim.height);


        render_sniper_lasers();

        for (let bid in GameEngine.blood) {
            let blood = GameEngine.blood[bid];
            blood.render(context);
        }

        for (let pid in GameEngine.players) {
            let player = GameEngine.players[pid];
            player.render(context);
        }

        for (let bid in GameEngine.bullets) {
            let bullet = GameEngine.bullets[bid];
            bullet.render(context);
        }

        for (let wall of GameEngine.walls) {
            wall.render(context);
        }

        for (let mid in GameEngine.muzzle_flash) {
            GameEngine.muzzle_flash[mid].render(context);
        }

        render_crosshair();
    }
    requestAnimationFrame(begin_render);
}


function initialize_input_output() {
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    canvas.addEventListener('mousemove', evt => {
        var mousePos = getMousePos(canvas, evt);
        GameEngine.MousePos = new Vec2(mousePos.x, mousePos.y);
        //PEERS_DATA_MAP[client.ID] = mousePos;
        //client.broadCast(mousePos);
    }, false);

    function onKeyDown(event) {
        var keyCode = event.keyCode;
        switch (keyCode) {
            case 68: //d
                GameEngine.KeyBoard.right = true;
                break;
            case 83: //s
                GameEngine.KeyBoard.down = true;
                break;
            case 65: //a
                GameEngine.KeyBoard.left = true;
                break;
            case 87: //w
                GameEngine.KeyBoard.up = true;
                break;
            case 82: //r
                GameEngine.KeyBoard.reload = true;
                break;
            case 49: //1
                GameEngine.KeyBoard.machineGun = true;
                break;
            case 50: //2
                GameEngine.KeyBoard.shotGun = true;
                break;
            case 51: //3
                GameEngine.KeyBoard.sniperGun = true;
                break;
            case 52: //4
                GameEngine.KeyBoard.bounceGun = true;
                break;
        }
    }

    function onKeyUp(event) {
        var keyCode = event.keyCode;
        switch (keyCode) {
            case 68: //d
                GameEngine.KeyBoard.right = false;
                break;
            case 83: //s
                GameEngine.KeyBoard.down = false;
                break;
            case 65: //a
                GameEngine.KeyBoard.left = false;
                break;
            case 87: //w
                GameEngine.KeyBoard.up = false;
                break;
            case 82: //r
                GameEngine.KeyBoard.reload = false;
                break;
            case 49: //1
                GameEngine.KeyBoard.machineGun = false;
                break;
            case 50: //2
                GameEngine.KeyBoard.shotGun = false;
                break;
            case 51: //3
                GameEngine.KeyBoard.sniperGun = false;
                break;
            case 52: //4
                GameEngine.KeyBoard.bounceGun = false;
                break;
        }
    }

    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);

    window.addEventListener('mousedown', function (e) {
        GameEngine.MouseDown = true;
    }, false);

    window.addEventListener('mouseup', function (e) {
        GameEngine.MouseDown = false;
    }, false);

    window.addEventListener('wheel', function (e) {
        if (e.wheelDelta > 0)
            GameEngine.MouseWheelValue--
        else
            GameEngine.MouseWheelValue++;



        if (GameEngine.MouseWheelValue < 0)
            GameEngine.MouseWheelValue = GameEngine.MouseWheel_MAX_VALUE;
        if (GameEngine.MouseWheelValue > GameEngine.MouseWheel_MAX_VALUE) {
            GameEngine.MouseWheelValue = 0;
        }

        GameEngine.MouseWheelUsed = true;


    });
}


function game_loop_check_player_collisons(onlyCheck = false) {
    let myPlayer = GameEngine.localPlayer;

    for (let wall of GameEngine.walls) {
        if (wall.isPlayerCollision(myPlayer)) {
            if (!onlyCheck)
                myPlayer.restorePosition();
            return true;
        }
    }

    for (let pid in GameEngine.players) {
        let player = GameEngine.players[pid];
        if (player.ID == myPlayer.ID)
            continue;
        if (myPlayer.collidesWithPlayer(player)) {
            if (!onlyCheck)
                myPlayer.restorePosition();
            return true;
        }
    }
    return false;
}

function respawn_player() {
    do {
        var x = Math.round(GameEngine.MapDim.width * Math.random());
        var y = Math.round(GameEngine.MapDim.height * Math.random());
        GameEngine.localPlayer = new Player(new Vec2(x, y), GameEngine.client.ID);
    } while (game_loop_check_player_collisons(true));
    GameEngine.players[GameEngine.client.ID] = GameEngine.localPlayer;
    GameEngine.localPlayer.revive();
}



function initialize_game_loop() {
    setInterval(() => {

        if (!GameEngine.localPlayer)
            return;

        GameEngine.localPlayer.saveCurrentPosition();
        var bullets = [];
        //Handle respawn  + dead player input
        if (GameEngine.localPlayer.isDead() && GameEngine.localPlayer.deadTimeMs() >= 3000) {
            respawn_player();
        } else if (!GameEngine.localPlayer.isDead()) {
            GameEngine.localPlayer.updateDirectionFromMousePosition(GameEngine.MousePos);
            GameEngine.localPlayer.updatePositionFromKeyboard(GameEngine.KeyBoard);
            bullets = GameEngine.localPlayer.updateMouseInputFire(GameEngine.MouseDown);
        }

        //update blood
        for (let bid in GameEngine.blood) {
            let blood = GameEngine.blood[bid];
            blood.update();
            if (blood.notVisible()) {
                delete GameEngine.blood[bid];
            }
        }

        //update all players
        for (let pid in GameEngine.players) {
            if (GameEngine.players[pid].isDead()) {
                delete GameEngine.last_weapon_selected[pid];
            }
            else if (GameEngine.last_weapon_selected[pid] != GameEngine.players[pid].gun.TYPE) {
                Player.MAKE_SWAP_SOUND();
                GameEngine.last_weapon_selected[pid] = GameEngine.players[pid].gun.TYPE;
            }
            GameEngine.players[pid].update();
        }


        for (let mid in GameEngine.muzzle_flash) {
            let mf = GameEngine.muzzle_flash[mid];
            mf.update();
            if (mf.notVisible()) {
                delete GameEngine.muzzle_flash[mid];
            }
        }

        //update check for bullets!
        for (let bid in GameEngine.bullets) {
            let tmpb = GameEngine.bullets[bid];
            if (!tmpb.didMakeFireSound()) {
                tmpb.makeFireSound();
            }
            if (!tmpb.CREATED_MUZZLE_FLASH) {
                GameEngine.muzzle_flash[bid] = new MuzzleFlash(tmpb);
                tmpb.CREATED_MUZZLE_FLASH = true;
            }

            let bulletCol = false;
            for (let pid in GameEngine.players) {
                let player = GameEngine.players[pid];
                if (player.collidesWithBullet(tmpb)) {
                    if (tmpb.hasPenetratedPlayer(pid))
                        continue;
                    if (player.ID == GameEngine.localPlayer.ID) {
                        player.position = player.position.add(tmpb.velocity.scale(0.5));
                        player.takeDamage(tmpb.damage);
                    }

                    let blood = new Blood(tmpb, player);
                    GameEngine.blood[blood.ID] = blood;
                    bulletCol = true;
                    if (tmpb.canPenetrateBody()) {
                        tmpb.applyPlayerPenetration(pid);
                        bulletCol = false;
                    }
                    Bullet.MAKE_BODY_IMPACT_SOUND();
                }
            }
            if (bulletCol) {
                delete GameEngine.bullets[bid];
            }

            tmpb.update();

            for (let wall of GameEngine.walls) {
                if (wall.isBulletCollision(tmpb)) {
                    if (!tmpb.canBounce()) {
                        delete GameEngine.bullets[bid];
                        tmpb.makeWallCollisionSound();
                        break;
                    } else {
                        if (tmpb.applyBounce(wall) !== null) {
                            tmpb.makeWallCollisionSound();
                            break;
                        }
                    }

                }
            }
        }

        game_loop_check_player_collisons();
        //will be kicked by other clients after several clients.
        if (document.hidden) {
            return;
        }
        //broadcasting information
        var obullets = [];
        if (bullets.length != 0) {
            for (let bullet of bullets) {
                let id = bullet.setLocalId();
                GameEngine.bullets[id] = bullet;
                obullets.push(bullet.toObject());
            }
        }
        client.broadCast({
            playerData: GameEngine.localPlayer.toObject(),
            bulletData: obullets,
            players: Object.keys(GameEngine.players)
        }, deadClientId => {
            delete GameEngine.players[deadClientId];
        });
    }, 1000 / GameEngine.FPS);
}

function initialize_host_or_join(callback) {
    if (window.location.hash != "") {
        var id = window.location.hash.substring(1);
        console.log("connecting to lobby", id);
        client.connect(id, () => {
            console.log("connected to ", id);
            callback();
        });
    } else {
        window.location.hash = client.ID;
        callback();
    }
}

function begin_game() {
    initialize_input_output();
    initialize_host_or_join(() => {
        initialize_game_loop();
        begin_render();
    })
}


GameEngine = {};
function main() {
    GameEngine.MapDim = {
        width: 800,
        height: 800,
    };

    GameEngine.GEOMETRY_MAX_SAFE_VAL = GameEngine.MapDim.width ** 2 + GameEngine.MapDim.height ** 2;

    GameEngine.KeyBoard = {
        up: false,
        left: false,
        down: false,
        right: false,
        reload: false,
        machineGun: false,
        shotGun: false,
        sniperGun: false,
        bounceGun: false
    };
    GameEngine.MouseDown = false;
    GameEngine.MousePos = new Vec2(0, 0);
    GameEngine.FPS = 30;
    GameEngine.USE_RELATIVE_MOVEMENT = false;
    GameEngine.I_AM_HOST = window.location.hash ? false : true;
    GameEngine.players = {};
    GameEngine.bullets = {};
    GameEngine.blood = {};
    GameEngine.muzzle_flash = {};
    GameEngine.last_weapon_selected = {};
    GameEngine.walls = Wall.CreateBasicMap(GameEngine.MapDim.width, GameEngine.MapDim.height);
    GameEngine.client = null;
    GameEngine.MouseWheelValue = 0;
    GameEngine.MouseWheel_MAX_VALUE = 3;
    GameEngine.MouseWheelUsed = true;

    console.log("loading textures...");
    var texture_promises = [];
    texture_promises.push(MachineGun.INITIALIZE_TEXTURE());
    texture_promises.push(MachineGun.INITIALIZE_SOUND());
    texture_promises.push(ShotGun.INITIALIZE_TEXTURE());
    texture_promises.push(ShotGun.INITIALIZE_SOUND());
    texture_promises.push(SniperGun.INITIALIZE_TEXTURE());
    texture_promises.push(SniperGun.INITIALIZE_SOUND());
    texture_promises.push(BounceGun.INITIALIZE_TEXTURE());
    texture_promises.push(BounceGun.INITIALIZE_SOUND());
    texture_promises.push(Blood.INITIALIZE_TEXTURE());
    texture_promises.push(MuzzleFlash.INITIALIZE_TEXTURE());
    texture_promises.push(Bullet.INITIALIZE_SOUND());
    texture_promises.push(Player.INITIALIZE_SOUND());
    Promise.all(texture_promises).then(() => {
        client = new PeerClient(dataRecieved => {
            GameEngine.players[dataRecieved.id] = Player.FromJSON(dataRecieved.data.playerData);
            for (let obullet of dataRecieved.data.bulletData) {
                let bullet = Bullet.FromJSON(obullet);
                GameEngine.bullets[bullet.ID] = bullet;
            }
            let player_ids = dataRecieved.data.players;


            //if recieved data from all players!
            if (!GameEngine.I_AM_HOST && !GameEngine.localPlayer) {
                //first spawn! (on join)
                //connect to all players, then continue!

                /*
                    problem connect z ze povezanimi peeri ko novi peer pride je
                    ce se 2 peera isto casno povezeta potem dobita podatke o potevzanih peerih, amapak drug o drugem ne vesta!
                    
                */
                client.connectAll(player_ids);
                if (Object.keys(GameEngine.players).length == player_ids.length) {
                    window.location.hash = client.ID; //if host dies, other can connect to you :)
                    respawn_player();
                }
            }
        });
        client.start(() => {
            GameEngine.client = client;
            if (GameEngine.I_AM_HOST) {
                respawn_player();
            }
            begin_game();
        });
    });
}