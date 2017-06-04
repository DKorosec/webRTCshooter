class ShotGun {

    static INITIALIZE_TEXTURE() {
        return new Promise((resolve, reject) => {
            var imageObj = new Image();
            imageObj.onload = function () {
                ShotGun.GUN_IMAGE = imageObj;
                resolve();
            };
            imageObj.src = 'images/shot_gun.png';
        });
    }

    static INITIALIZE_SOUND() {
        ShotGun.FIRE_SRC_URL = 'sounds/shot_gun.wav';
        return new Promise((resolve, reject) => {
            var sound = new Audio(ShotGun.FIRE_SRC_URL);
            sound.addEventListener('canplaythrough', resolve, false);
        })
    }


    static MAKE_FIRE_SOUND() {
        if (!ShotGun.FIRE_SRC) {
            ShotGun.FIRE_SRC = document.createElement("source");
            ShotGun.FIRE_SRC.type = "audio/mpeg";
            ShotGun.FIRE_SRC.src = ShotGun.FIRE_SRC_URL;
        }
        var snd = new Audio();
        snd.appendChild(ShotGun.FIRE_SRC);
        snd.play();
    }

    constructor() {
        this.TYPE = ShotGun.TYPE;
        const bulletsPerSecond = 0.75;
        this.reloadTimeMS = 1000 * 5;
        this.velocity = 20;
        this.rapidFireMs = Math.round(1000 / bulletsPerSecond);
        this.lastShotMs = 0;
        this.recoilError = Math.PI / 180 * 5; //5 degrees
        this.maxAmmo = 3;
        this.currentAmmo = this.maxAmmo;
        this.bulletsOnFire = 8;
        this.totalSpreadAngle = Math.PI / 180 * 45 //45 degrees
        this.damage = 25;
        this.bulletRadius = 5;

        this.gunLength = 90;
        this.render_x_offset = -30;
        this.gunFireCenterOffset = this.gunLength + this.render_x_offset;
    }

    reload() {
        if (this.currentAmmo == 0)
            return false;
        this.lastShotMs = +new Date();
        this.currentAmmo = 0;
        return true;
    }

    fire(position, direction) {
        let timeNow = +new Date();
        if (timeNow - this.lastShotMs < this.rapidFireMs)
            return []; //array, if shotgun will be included
        if (this.currentAmmo <= 0) {
            return [];
        }

        let bullets = [];
        let halfAngle = this.totalSpreadAngle / 2;
        for (let i = 0; i < this.bulletsOnFire; i++) {
            var offsetAngle = (Math.random() * 2 - 1) * this.recoilError;
            var shotAngle = i / this.bulletsOnFire * this.totalSpreadAngle - halfAngle;
            var newDir = direction.rotate(offsetAngle + shotAngle);
            var bullet = new Bullet(position.copy(), newDir.scale(this.velocity), this.damage, this.bulletRadius, ShotGun.TYPE);
            if (i != 0)
                bullet.muteSound = true;
            bullets.push(bullet);
        }
        this.lastShotMs = timeNow;
        this.currentAmmo--;
        return bullets;
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

        ctx.drawImage(ShotGun.GUN_IMAGE, this.render_x_offset, -7.5, this.gunLength, 15)

        ctx.restore();
    }


    static FromJSON(json) {
        var mg = new ShotGun();
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
        /*
        return {
            reloadTimeMS: this.reloadTimeMS,
            velocity: this.velocity,
            rapidFireMs: this.rapidFireMs,
            lastShotMs: this.lastShotMs,
            recoilError: this.recoilError,
            maxAmmo: this.maxAmmo,
            currentAmmo: this.currentAmmo
        };*/
    }
}
ShotGun.TYPE = 2;