class SniperGun {


    static INITIALIZE_TEXTURE() {
        return new Promise((resolve, reject) => {
            var imageObj = new Image();
            imageObj.onload = function () {
                SniperGun.GUN_IMAGE = imageObj;
                resolve();
            };
            imageObj.src = 'images/sniper_gun.png';
        });
    }

    static INITIALIZE_SOUND() {
        SniperGun.FIRE_SRC_URL = 'sounds/sniper_gun.wav';
        return new Promise((resolve, reject) => {
            var sound = new Audio(SniperGun.FIRE_SRC_URL);
            sound.addEventListener('canplaythrough', resolve, false);
        })
    }


    static MAKE_FIRE_SOUND() {
        if (!SniperGun.FIRE_SRC) {
            SniperGun.FIRE_SRC = document.createElement("source");
            SniperGun.FIRE_SRC.type = "audio/mpeg";
            SniperGun.FIRE_SRC.src = SniperGun.FIRE_SRC_URL;
        }
        var snd = new Audio();
        snd.appendChild(SniperGun.FIRE_SRC);
        snd.play();
    }

    constructor() {
        this.TYPE = SniperGun.TYPE;
        const bulletsPerSecond = 1;
        this.reloadTimeMS = 1000 * 10;
        this.velocity = 55;
        this.rapidFireMs = Math.round(1000 / bulletsPerSecond);
        this.lastShotMs = 0;
        this.recoilError = Math.PI / 180 * 0; //0 degrees
        this.maxAmmo = 1;
        this.currentAmmo = this.maxAmmo;
        this.damage = 100;
        this.bulletRadius = 5;

        this.gunLength = 110;
        this.render_x_offset = -45;
        this.gunFireCenterOffset = this.gunLength + this.render_x_offset;
    }

    reload() {
        if (this.currentAmmo == 0)
            return false;
        this.lastShotMs = +new Date();
        this.currentAmmo = 0;
        return true;
    }

    getRapidFireWaitPercentage() {
        let timeDiff = (+new Date()) - this.lastShotMs;
        if (timeDiff < this.rapidFireMs) {
            return 1 - timeDiff / this.rapidFireMs;
        }
        return 0;
    }

    isReloading() {
        return this.currentAmmo == 0;
    }

    fire(position, direction) {
        let timeNow = +new Date();
        if (timeNow - this.lastShotMs < this.rapidFireMs)
            return []; //array, if shotgun will be included
        if (this.currentAmmo <= 0) {
            return [];
        }
        var offsetAngle = (Math.random() * 2 - 1) * this.recoilError;
        var newDir = direction.rotate(offsetAngle);
        var bullet = new Bullet(position.copy(), newDir.scale(this.velocity), this.damage, this.bulletRadius, SniperGun.TYPE);
        this.lastShotMs = timeNow;
        this.currentAmmo--;
        return [bullet];
    }

    getReloadPercentage() {
        if (this.currentAmmo <= 0) {
            let timeNow = +new Date();
            if (timeNow - this.lastShotMs > this.reloadTimeMS) {
                return 1;
            } else {
                return (timeNow - this.lastShotMs) / this.reloadTimeMS;
            }
        } else {
            return 1;
        }
    }

    update() {
        if (this.currentAmmo <= 0) {
            let timeNow = +new Date();
            if (timeNow - this.lastShotMs > this.reloadTimeMS) {
                this.currentAmmo = this.maxAmmo;
            }
        }
    }

    render(player, ctx) {
        var new_center = player.getWeaponCenterPos();
        ctx.save();
        ctx.translate(...new_center);
        ctx.rotate(2 * Math.PI - player.direction.fullAngle(new Vec2(1, 0)));

        ctx.drawImage(SniperGun.GUN_IMAGE, this.render_x_offset, -9, this.gunLength, 20)

        ctx.restore();
    }

    static FromJSON(json) {
        var mg = new SniperGun();
        for (let prop in mg) {
            mg[prop] = json[prop];
        }
        return mg;
    }

    toObject() {
        var obj = {};
        for (let prop in this) {
            obj[prop] = this[prop];
        }
        return obj;
    }
}
SniperGun.TYPE = 3;