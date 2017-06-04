class Blood {
    static INITIALIZE_TEXTURE() {
        return new Promise((resolve, reject) => {
            var imageObj = new Image();
            imageObj.onload = function () {
                Blood.BLOOD_IMAGE = imageObj;
                resolve();
            };
            imageObj.src = 'images/blood.png';
        });
    }
    constructor(bullet, player) {

        let position = bullet.position,
            direction = bullet.velocity.norm().scale(-1),
            size = bullet.damage;
        if (size > 30)
            size = 30;
        this.both_sides = bullet.canPenetrateBody();
        this.TIME_ALIVE = 1000 * 20; //20 secs
        this.ID = ++Blood.ID_GEN;
        this.time_created = +new Date();
        this.time_elapsed = 0;
        var vec = player.position.vecTo(position).norm().scale(player.bodyRadius);
        this.position = player.position.add(vec);//position.copy();
        this.direction = direction.copy();
        this.size = size * 5;
        this.player = player;


    }

    notVisible() {
        return this.time_elapsed >= this.TIME_ALIVE;
    }

    update() {
        this.time_elapsed = (+new Date()) - this.time_created;
    }

    render(ctx) {
        ctx.save();

        ctx.translate(...this.position);
        ctx.rotate(2 * Math.PI - this.direction.fullAngle(new Vec2(1, 0)));
        let alpha = 1 - this.time_elapsed / this.TIME_ALIVE;
        ctx.globalAlpha = alpha > 0 ? alpha : 0;
        ctx.drawImage(Blood.BLOOD_IMAGE, 0, -this.size / 2, this.size, this.size)

        ctx.restore();

        if (this.both_sides) {
            ctx.save();

            ctx.translate(...this.position);
            ctx.rotate(Math.PI + 2 * Math.PI - this.direction.fullAngle(new Vec2(1, 0)));
            alpha = 1 - this.time_elapsed / this.TIME_ALIVE;
            ctx.globalAlpha = alpha > 0 ? alpha : 0;
            ctx.drawImage(Blood.BLOOD_IMAGE, 0, -this.size / 2, this.size, this.size)

            ctx.restore();
        }
    }
}
Blood.ID_GEN = 1;