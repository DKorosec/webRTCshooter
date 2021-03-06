class MachineGun {

    static INITIALIZE_TEXTURE() {
        return new Promise((resolve, reject) => {
            var imageObj = new Image();
            imageObj.onload = function () {
                MachineGun.GUN_IMAGE = imageObj;
                resolve();
            };
            imageObj.src = 'images/machine_gun.png';
        });
    }

    static INITIALIZE_SOUND() {
        MachineGun.FIRE_SRC_URL = 'sounds/machine_gun.wav';
        return new Promise((resolve, reject) => {
            var sound = new Audio(MachineGun.FIRE_SRC_URL);
            sound.addEventListener('canplaythrough', resolve, false);
        })
    }


    static MAKE_FIRE_SOUND() {
        if (!MachineGun.FIRE_SRC) {
            MachineGun.FIRE_SRC = document.createElement("source");
            MachineGun.FIRE_SRC.type = "audio/mpeg";
            MachineGun.FIRE_SRC.src = MachineGun.FIRE_SRC_URL;
        }
        var snd = new Audio();
        snd.appendChild(MachineGun.FIRE_SRC);
        snd.play();
    }


    constructor() {
        this.TYPE = MachineGun.TYPE;
        const bulletsPerSecond = 10;
        this.reloadTimeMS = 1000 * 3;
        this.velocity = 15;
        this.rapidFireMs = Math.round(1000 / bulletsPerSecond);
        this.lastShotMs = 0;
        this.recoilError = Math.PI / 180 * 8; //8 degrees
        this.maxAmmo = 25;
        this.currentAmmo = this.maxAmmo;
        this.damage = 8;
        this.bulletRadius = 3;

        this.gunLength = 108;
        this.render_x_offset = -40;
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
        var bullet = new Bullet(position.copy(), newDir.scale(this.velocity), this.damage, this.bulletRadius, MachineGun.TYPE);
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

        ctx.drawImage(MachineGun.GUN_IMAGE, this.render_x_offset, -7.5, this.gunLength, 15)

        ctx.restore();
    }

    static FromJSON(json) {
        var mg = new MachineGun();
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
            currentAmmo: this.currentAmmo,
            damage : this.damage
        };*/
    }
}
MachineGun.TYPE = 1;