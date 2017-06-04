class Player {
    constructor(position, id) {
        this.ID = id;

        this.inv_machineGun = new MachineGun();
        this.inv_shotGun = new ShotGun();
        this.inv_sniperGun = new SniperGun();
        this.inv_bounceGun = new BounceGun();

        this.position = position;
        this.direction = new Vec2(1, 0);
        this.bodyRadius = 25;
        this.moveSpeed = 5;
        //this.gunLength = this.bodyRadius * 1.8;
        this.health = 100;
        this.gun = this.inv_machineGun;
        this.bodyColor = Player.stringToColour(id);
        this.deadMarkTime = -1;
    }

    restorePosition() {
        this.position = this.__TMP_POS.copy();
        delete this.__TMP_POS;
    }
    saveCurrentPosition() {
        this.__TMP_POS = this.position.copy();
    }

    getBoundingBox() {
        var ul = this.position.add(new Vec2(-this.bodyRadius / 2, -this.bodyRadius / 2));
        return new Wall(...ul, this.bodyRadius, this.bodyRadius);
    }


    getIntersections(p1, p2) {
        //p1 is the first line point
        //p2 is the second line point
        var c = this.position;
        var r = this.bodyRadius;

        var p3 = { x: p1.x - c.x, y: p1.y - c.y }; //shifted line points
        var p4 = { x: p2.x - c.x, y: p2.y - c.y };

        var m = (p4.y - p3.y) / (p4.x - p3.x); //slope of the line
        var b = p3.y - m * p3.x; //y-intercept of line

        var underRadical = Math.pow(r, 2) * Math.pow(m, 2) + Math.pow(r, 2) - Math.pow(b, 2); //the value under the square root sign 

        if (underRadical < 0) {
            //line completely missed
            return [];
        } else {
            var t1 = (-m * b + Math.sqrt(underRadical)) / (Math.pow(m, 2) + 1); //one of the intercept x's
            var t2 = (-m * b - Math.sqrt(underRadical)) / (Math.pow(m, 2) + 1); //other intercept's x
            var i1 = new Vec2(t1 + c.x, m * t1 + b + c.y); //intercept point 1
            var i2 = new Vec2(t2 + c.x, m * t2 + b + c.y); //intercept point 2
            return [i1, i2];
        }
    }


    takeDamage(dmg) {
        if (this.health == 0)
            return;
        this.health -= dmg;
        if (this.health <= 0) {
            this.health = 0;
            this.deadMarkTime = +new Date();
        }
    }

    deadTimeMs() {
        return (+new Date()) - this.deadMarkTime;
    }

    revive() {
        this.health = 100;
        this.deadMarkTime = -1;
    }

    isDead() {
        return this.health == 0;
    }

    toObject() {
        var jsonedObject = {};
        for (var x in this) {
            if (x === "toJSON" || x === "constructor" || x === "__tmpColliders") {
                continue;
            }
            jsonedObject[x] = this[x].toObject ? this[x].toObject() : this[x];
        }
        return jsonedObject;
    }

    getColliders() {
        const colliders = 20;
        const colliderRadius = this.bodyRadius * 1.1;
        if (!this.__tmpColliders) {
            this.__tmpColliders = [];
            for (let i = 0; i < colliders; i++) {
                let angle = (2 * Math.PI) * (i / colliders);
                this.__tmpColliders.push(Vec2.fromAngle(angle).scale(colliderRadius));
            }
        }
        var result = [];
        for (let i = 0; i < this.__tmpColliders.length; i++) {
            result.push(this.position.add(this.__tmpColliders[i]))
        }
        result.push(this.position);
        return result;
    }

    static FromJSON(json) {
        var np = new Player(null, null);
        np.ID = json.ID; //json.id je delalo, vendar nepravilno!
        np.position = new Vec2(json.position.x, json.position.y);
        np.direction = new Vec2(json.direction.x, json.direction.y);
        np.moveSpeed = json.moveSpeed;
        np.bodyRadius = json.bodyRadius;
        np.gunLength = json.gunLength;
        np.bodyColor = json.bodyColor;
        np.health = json.health;

        np.gun = ([null, MachineGun, ShotGun, SniperGun, BounceGun][json.gun.TYPE]).FromJSON(json.gun);
        np.deadMarkTime = json.deadMarkTime;

        np.inv_machineGun = MachineGun.FromJSON(json.inv_machineGun);
        np.inv_shotGun = ShotGun.FromJSON(json.inv_shotGun);
        np.inv_sniperGun = SniperGun.FromJSON(json.inv_sniperGun);
        np.inv_bounceGun = BounceGun.FromJSON(json.inv_bounceGun);



        return np;
    }

    updateFromJSON(json) {
        this.position = new Vec2(json.position.x, json.position.y);
        this.direction = new Vec2(json.direction.x, json.direction.y);
        this.moveSpeed = json.moveSpeed;
        this.bodyRadius = json.bodyRadius;
        //this.gunLength = json.gunLength;
        this.bodyColor = json.bodyColor;
        this.health = json.health;

        this.gun = ([null, MachineGun, ShotGun, SniperGun, BounceGun][json.gun.TYPE]).FromJSON(json.gun);
        this.deadMarkTime = json.deadMarkTime;

        this.inv_machineGun = MachineGun.FromJSON(json.inv_machineGun);
        this.inv_shotGun = ShotGun.FromJSON(json.inv_shotGun);
        this.inv_sniperGun = SniperGun.FromJSON(json.inv_sniperGun);
        this.inv_bounceGun = BounceGun.FromJSON(json.inv_bounceGun);
    }

    static stringToColour(str) {
        if (!str)
            return "black";
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }

    collidesWithPlayer(player) {
        //todo daljica med obema in jo raztegni na polovici!
        let distance = this.position.distance(player.position);
        return distance <= this.bodyRadius * 1.2 + player.bodyRadius * 1.2;
    }
    collidesWithBullet(bullet) {
        for (let collider of bullet.getColliders()) {
            let colRad = /*bullet.radius +*/ this.bodyRadius;
            if (this.position.distance(collider) < colRad) {
                return true;
            }
        }
        return false;
    }

    updateMouseInputFire(mouseDown) {
        var ret = [];
        if (mouseDown && this.weaponNotInWall()) {
            ret = this.gun.fire(this.getWeaponCenterPos().add(this.direction.scale(this.gun.gunFireCenterOffset)),
                this.direction);
            for (let retB of ret) {
                retB.color = this.bodyColor;
            }
        }
        return ret;
    }

    weaponNotInWall() {
        for (let wall of GameEngine.walls) {
            if (wall.isWeaponFireCollision(this.getPlayerFireOutputPosition(), this.gun.bulletRadius))
                return false;
        }
        return true;
    }

    getPlayerFireOutputPosition() {
        return this.getWeaponCenterPos().add(this.direction.scale(this.gun.gunFireCenterOffset));
    }


    _moveAbsoluteKeyState(keyState) {
        if (keyState.up) {
            let tmp_pos = this.position.copy();
            this.position = this.position.add(new Vec2(0, -1).scale(this.moveSpeed));
            if (game_loop_check_player_collisons(true)) //check 4 all, because this is not an else if stmt!
                this.position = tmp_pos;
        }
        if (keyState.down) {
            let tmp_pos = this.position.copy();
            this.position = this.position.add(new Vec2(0, 1).scale(this.moveSpeed));
            if (game_loop_check_player_collisons(true))
                this.position = tmp_pos;
        }
        if (keyState.left) {
            let tmp_pos = this.position.copy();
            this.position = this.position.add(new Vec2(-1, 0).scale(this.moveSpeed));
            if (game_loop_check_player_collisons(true))
                this.position = tmp_pos;
        }
        if (keyState.right) {
            let tmp_pos = this.position.copy();
            this.position = this.position.add(new Vec2(1, 0).scale(this.moveSpeed));
            if (game_loop_check_player_collisons(true))
                this.position = tmp_pos;
        }
    }
    _moveRelativeKeyState(keyState) {
        if (keyState.up) {
            let tmp_pos = this.position.copy();
            this.position = this.position.add(this.direction.norm().scale(this.moveSpeed));
            if (game_loop_check_player_collisons(true)) //check 4 all, because this is not an else if stmt!
                this.position = tmp_pos;
        }
        if (keyState.down) {
            let tmp_pos = this.position.copy();
            this.position = this.position.add(this.direction.norm().scale(-this.moveSpeed));
            if (game_loop_check_player_collisons(true))
                this.position = tmp_pos;
        }
        if (keyState.left) {
            let tmp_pos = this.position.copy();
            this.position = this.position.add(this.direction.norm().rightSidePerpendicular().scale(this.moveSpeed));
            if (game_loop_check_player_collisons(true))
                this.position = tmp_pos;
        }
        if (keyState.right) {
            let tmp_pos = this.position.copy();
             this.position = this.position.add(this.direction.norm().leftSidePerpendicular().scale(this.moveSpeed));
            if (game_loop_check_player_collisons(true))
                this.position = tmp_pos;
        }
    }

    updatePositionFromKeyboard(keyState) {
        let startPos = this.position.copy();
        if (GameEngine.USE_RELATIVE_MOVEMENT) {
            this._moveRelativeKeyState(keyState);
        } else {
            this._moveAbsoluteKeyState(keyState);
        }

        if (keyState.reload) {
            this.gun.reload();
        }
        if (!this.gun.isReloading() && this.gun.getRapidFireWaitPercentage() == 0) { //if not reloading and weapon ready to fire
            if (keyState.machineGun) {
                this.gun = this.inv_machineGun;
            }
            if (keyState.shotGun) {
                this.gun = this.inv_shotGun;
            }
            if (keyState.sniperGun) {
                this.gun = this.inv_sniperGun;
            }
            if (keyState.bounceGun) {
                this.gun = this.inv_bounceGun;
            }
        }

        var movVec = startPos.vecTo(this.position);
        if (movVec.len() > this.moveSpeed) {
            //if key left and up is both held down! or other directions that could sum up!
            movVec = movVec.norm().scale(this.moveSpeed);
            this.position = startPos.add(movVec);
        }
    }

    update() {
        this.gun.update();
    }


    updateDirectionFromMousePosition(mousePos) {
        this.direction = this.position.vecTo(mousePos).norm();

        //rotate for aditional angle, so the gun points to the cursor not the front!
        var wp = this.getWeaponCenterPos();
        var angle = wp.vecTo(mousePos).angle(this.direction);
        this.direction = this.direction.rotate(-angle);
    }

    getWeaponOffsetFromCenter() {
        var lpv = this.direction.leftSidePerpendicular();
        return lpv.scale(this.bodyRadius);
    }

    getWeaponCenterPos() {
        //Center pos may vary from weapon that is currenlty selected?!
        return this.position.add(this.getWeaponOffsetFromCenter());
    }

    render(ctx) {
        ctx.strokeStyle = "black"

        if (!this.isDead()) {

            this.gun.render(this, ctx);
            /*
            var new_center = this.getWeaponCenterPos();
            ctx.beginPath();
            ctx.lineWidth = 8;
            ctx.moveTo(...new_center);
            ctx.lineTo(...new_center.add(this.direction.scale(this.gunLength)));
            ctx.stroke();*/
            /*
            ctx.beginPath();
            ctx.lineWidth = 8;
            ctx.moveTo(...this.position);
            ctx.lineTo(...this.position.add(this.direction.scale(this.gunLength)));
            ctx.stroke();*/
        }

        ctx.beginPath();
        ctx.lineWidth = 8
        ctx.arc(...this.position, this.bodyRadius, 0, 2 * Math.PI);
        ctx.fillStyle = this.bodyColor;
        ctx.fill();
        ctx.stroke();

        var radiusInfo = this.bodyRadius * 1.1;
        var radiusInfoAmmo = this.bodyRadius * 1.2;
        var infoW = 3;

        ctx.beginPath();
        ctx.lineWidth = infoW;
        ctx.strokeStyle = "red";
        ctx.arc(...this.position, radiusInfo, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = infoW;
        ctx.strokeStyle = "lime";
        ctx.arc(...this.position, radiusInfo, 0, 2 * Math.PI * this.health / 100);
        ctx.stroke();
        ctx.closePath();


        ctx.beginPath();
        ctx.lineWidth = infoW;
        ctx.strokeStyle = "gray";
        ctx.arc(...this.position, radiusInfoAmmo, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = infoW;
        ctx.strokeStyle = "yellow";
        if (this.gun.currentAmmo > 0) {
            ctx.arc(...this.position, radiusInfoAmmo, 0, (2 * Math.PI * this.gun.currentAmmo / this.gun.maxAmmo) + (2 * Math.PI * 1 / this.gun.maxAmmo) * this.gun.getRapidFireWaitPercentage());
        } else {
            ctx.strokeStyle = "orange";
            ctx.arc(...this.position, radiusInfoAmmo, 0, 2 * Math.PI * this.gun.getReloadPercentage());
        }
        ctx.stroke();
        ctx.closePath();
    }
}