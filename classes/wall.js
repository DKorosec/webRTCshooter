class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.lines = {
            top: { a: new Vec2(x, y), b: new Vec2(x + w, y) },
            bottom: { a: new Vec2(x, y + h), b: new Vec2(x + w, y + h) },
            left: { a: new Vec2(x, y), b: new Vec2(x, y + h) },
            right: { a: new Vec2(x + w, y), b: new Vec2(x + w, y + h) },
        }
    }
    render(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }


    lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        var ua, ub, denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom == 0) {
            return false;
        }
        ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

        let seg1 = ua >= 0 && ua <= 1;
        let seg2 = ub >= 0 && ub <= 1;

        if (!seg1 || !seg2)
            return false;

        return new Vec2(
            x1 + ua * (x2 - x1),
            y1 + ua * (y2 - y1)
        );
    }


    getIntersectionFace(bullet) {
        //emulated! (bullet.prev_position is not good for this task) or maybe?
        let bullet_prev = bullet.position.sub(bullet.velocity);
        for (let lineName in this.lines) {
            let line = this.lines[lineName];
            let pt = this.lineIntersect(...line.a, ...line.b, ...bullet_prev, ...bullet.position);
            if (pt) {
                return { lineName, pt };
            }
        }
        return null;
    }


    getIntersections(a, b) {
        var intersections = [];
        for (let lineName in this.lines) {
            let line = this.lines[lineName];
            let pt = this.lineIntersect(...line.a, ...line.b, ...a, ...b);
            if (pt) {
                intersections.push(pt);
            }
        }
        return intersections;
    }


    isBulletCollision(bullet) {
        for (let collider of bullet.getColliders()) {
            if (this.x < collider.x && collider.x < this.x + this.w &&
                this.y < collider.y && collider.y < this.y + this.h) {
                return true;
            }
        }
        return false;
    }

    isWeaponFireCollision(collider, bulletRad) {
        if (this.x < collider.x + bulletRad && collider.x < this.x + this.w + bulletRad &&
            this.y < collider.y + bulletRad && collider.y < this.y + this.h + bulletRad) {
            return true;
        }
        return false;
    }

    isPlayerCollision(player) {
        let circle = player.position;
        let circle_r = player.bodyRadius;
        let circleDistance = new Vec2(0, 0);
        circleDistance.x = Math.abs(circle.x - (this.x + this.w/2));
        circleDistance.y = Math.abs(circle.y - (this.y + this.h/2));

        if (circleDistance.x > (this.w / 2 + circle_r)) { return false; }
        if (circleDistance.y > (this.h / 2 + circle_r)) { return false; }

        if (circleDistance.x <= (this.w / 2)) { return true; }
        if (circleDistance.y <= (this.h / 2)) { return true; }

        let cornerDistance_sq = ((circleDistance.x - this.w / 2) ** 2) + ((circleDistance.y - this.h / 2) ** 2);

        return (cornerDistance_sq <= (circle_r ** 2));
        //return this.isBulletCollision(player);
    }

    static CreateBasicMap(MapW, MapH) {
        return [
            new Wall(-100, -100, MapW + 200, 100),
            new Wall(-100, -100, 100, MapH + 200),
            new Wall(MapW, -100, 100, MapH + 200),
            new Wall(-100, MapH, MapW + 200, 100),
            new Wall(100, 100, 100, 100),
            new Wall(600, 100, 100, 100),
            new Wall(100, 600, 100, 100),
            new Wall(600, 600, 100, 100),
            new Wall(350, 350, 100, 100),
            new Wall(600, 375, 200, 50),
            new Wall(0, 375, 200, 50),
            new Wall(350, 100, 100, 100)
        ];
    }
}