class Bullet {


    static INITIALIZE_SOUND() {

        Bullet.FIRE_HIT_WALL_URL = 'sounds/bullet_impact_wall.wav';
        Bullet.FIRE_HIT_BODY_URL = 'sounds/bullet_impact_body.wav';
        let promises = [];

        return new Promise((resolve, reject) => {
            promises.push(new Promise((resolve, reject) => {
                var sound = new Audio(Bullet.FIRE_HIT_WALL_URL);
                sound.addEventListener('canplaythrough', resolve, false);
            }));

            promises.push(new Promise((resolve, reject) => {
                var sound = new Audio(Bullet.FIRE_HIT_BODY_URL);
                sound.addEventListener('canplaythrough', resolve, false);
            }));
            Promise.all(promises).then(resolve);
        });
    }


    static MAKE_WALL_IMPACT_SOUND() {
        if (!Bullet.FIRE_HIT_WALL) {
            Bullet.FIRE_HIT_WALL = document.createElement("source");
            Bullet.FIRE_HIT_WALL.type = "audio/mpeg";
            Bullet.FIRE_HIT_WALL.src = Bullet.FIRE_HIT_WALL_URL;
        }
        var snd = new Audio();
        snd.appendChild(Bullet.FIRE_HIT_WALL);
        snd.play();
    }

    static MAKE_BODY_IMPACT_SOUND() {
        if (!Bullet.FIRE_HIT_BODY) {
            Bullet.FIRE_HIT_BODY = document.createElement("source");
            Bullet.FIRE_HIT_BODY.type = "audio/mpeg";
            Bullet.FIRE_HIT_BODY.src = Bullet.FIRE_HIT_BODY_URL;
        }
        var snd = new Audio();
        snd.appendChild(Bullet.FIRE_HIT_BODY);
        snd.play();
    }


    constructor(pos, vel, damage, radius, weaponType, bounceCount = 0) {
        this.ID = null;
        this.weaponType = weaponType;
        this.position = pos;
        this.prev_position = pos ? pos.copy() : pos;
        this.velocity = vel;
        this.radius = radius;
        this.color = "black";
        this.damage = damage;
        this.bounceCount = bounceCount;
        this.muteSound = false;
        this.PID_PENETRATED = {};
        this.MADE_FIRE_SOUND = false;
        this.LAST_BOUNCE_T = 0;
    }

    makeWallCollisionSound() {
        /*if (this.canBounce()) {
            let time = +new Date();
            if (time - this.LAST_BOUNCE_T < 100)
                return;
            this.LAST_BOUNCE_T = time;
        }*/
        Bullet.MAKE_WALL_IMPACT_SOUND();
    }

    didMakeFireSound() {
        return this.MADE_FIRE_SOUND;
    }

    makeFireSound() {
        if (!this.muteSound) {
            ([null, MachineGun, ShotGun, SniperGun, BounceGun][this.weaponType]).MAKE_FIRE_SOUND();
            this.MADE_FIRE_SOUND = true;
        }
    }

    hasPenetratedPlayer(pid) {
        return this.PID_PENETRATED[pid];
    }

    canBounce() {
        return this.bounceCount > 0;
    }

    applyBounce(wall) {

        let intersect = wall.getIntersectionFace(this);
        if (!intersect)
            return null;
        let scale_y = 1;
        let scale_x = 1;
        switch (intersect.lineName) {
            case "top":
                this.velocity.y *= -5;
                scale_y = 5;
                break;
            case "bottom":
                this.velocity.y *= -5;
                scale_y = 5;
                break;
            case "left":
                this.velocity.x *= -5;
                scale_x = 5;
                break;
            case "right":
                this.velocity.x *= -5;
                scale_x = 5;
                break;
            default:
                --this.bounceCount;
                return;
        }

        //dity hax
        let prev_vel = this.velocity.copy();
        this.velocity = this.velocity.norm();
        this.position = /*this.prev_position? this.prev_position.copy() :*/ intersect.pt.copy();
        let i_c = 0;
        for (; i_c < 40; i_c++) {
            if (wall.isBulletCollision(this))
                this.update();
            else break;
        }
        this.velocity = prev_vel;
        this.velocity.x /= scale_x;
        this.velocity.y /= scale_y;
        --this.bounceCount;
        if (i_c == 40) {
            this.bounceCount = 0;
        }
    }



    toObject() {
        return {
            position: this.position.toObject(),
            velocity: this.velocity.toObject(),
            prev_position: this.prev_position.toObject(),
            radius: this.radius,
            color: this.color,
            damage: this.damage,
            bounceCount: this.bounceCount,
            weaponType: this.weaponType,
            muteSound: this.muteSound
        };
    }

    applyPlayerPenetration(pid) {
        this.PID_PENETRATED[pid] = true;
    }
    canPenetrateBody() {
        return this.weaponType == SniperGun.TYPE;
    }

    getColliders() {
        const colliders = 6;
        const interpolateLevel = 5;
        if (!this.__tmpColliders) {
            this.__tmpColliders = [];
            for (let i = 0; i < colliders; i++) {
                let angle = (2 * Math.PI) * (i / colliders);
                this.__tmpColliders.push(Vec2.fromAngle(angle).scale(this.radius));
            }
        }

        let relative_vec = this.prev_position.vecTo(this.position);
        var result = [];
        for (let j = 0; j <= interpolateLevel; j++) {
            let fac = j / interpolateLevel;
            let tmpv = relative_vec.scale(fac);
            let tmp_absv = this.prev_position.add(tmpv);
            for (let i = 0; i < this.__tmpColliders.length; i++) {
                result.push(tmp_absv.add(this.__tmpColliders[i]))
            }
        }
        return result;
    }

    static FromJSON(json) {
        var ret = new Bullet(null, null);
        ret.ID = ++Bullet.ID_GEN;
        ret.position = new Vec2(json.position.x, json.position.y);
        ret.velocity = new Vec2(json.velocity.x, json.velocity.y);
        ret.prev_position = new Vec2(json.prev_position.x, json.prev_position.y);
        ret.radius = json.radius;
        ret.color = json.color;
        ret.damage = json.damage;
        ret.bounceCount = json.bounceCount;
        ret.weaponType = json.weaponType;
        ret.muteSound = json.muteSound;
        return ret;
    }

    setLocalId() {
        this.ID = ++Bullet.ID_GEN;
        return this.ID;
    }

    render(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.arc(...this.position, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
    }

    update() {
        this.prev_position = this.position.copy();
        this.position = this.position.add(this.velocity);
    }
}
Bullet.ID_GEN = 0; 