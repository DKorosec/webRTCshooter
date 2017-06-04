class MuzzleFlash {

    static INITIALIZE_TEXTURE() {
        return new Promise((resolve, reject) => {
            MuzzleFlash.IMAGES = new Array(4);
            let promises = new Array(4);
            for (let i = 0; i < 4; i++) {
                promises[i] = new Promise((resolve, reject) => {
                    var imageObj = new Image();
                    imageObj.onload = () => {
                        MuzzleFlash.IMAGES[i] = imageObj;
                        resolve();
                    };
                    imageObj.src = 'images/flash' + (i + 1) + '.png';
                });
            }
            Promise.all(promises).then(resolve);
        });
    }

    constructor(bullet) {
        this.position = bullet.position.copy();
        this.direction = bullet.velocity.norm();
        this.frame_i = 1;
        this.last_frame_t = null;
        this.max_frame = 4;
        this.ms_on_frame = 15;
        this.size = 50; //dreive property from bullet?
    }

    update() {
        let time = +new Date();
        if (this.last_frame_t === null) {
            this.last_frame_t = time;
            return;
        } else {
            if (time - this.last_frame_t >= this.ms_on_frame) {
                this.frame_i++;
                this.last_frame_t = time;
            }
        }
    }

    notVisible() {
        return this.frame_i >= this.max_frame;
    }

    render(ctx) {
        if (this.frame_i >= this.max_frame)
            return;
        ctx.save();
        ctx.translate(...this.position.add(this.direction.scale(20)));
        ctx.rotate(2 * Math.PI - this.direction.fullAngle(new Vec2(1, 0)));
        ctx.drawImage(MuzzleFlash.IMAGES[this.frame_i], -this.size / 2, -this.size / 2, this.size * 2, this.size)

        ctx.restore();
    }
}