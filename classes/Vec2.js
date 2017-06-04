class Vec2 {
	static fromAngle(angle) /*returns a new constructed vector from given  angle (in radians)*/ {
		return new Vec2(Math.cos(angle), Math.sin(angle));
	}
	constructor(x = 0, y = 0) {
		this.setPos(x, y);
	}
	setPos(x, y) {
		this.x = x;
		this.y = y;
	}
	perpendicularVectorTo(vector) /*returns vector that is perpendicular to this vector and its length is the shortest distance between this vector and end point of the argument vector.*/ {
		var this_norm = this.norm();
		var scale = vector.scalar(this_norm);
		var this_scaled = this_norm.scale(scale);
		return this_scaled.vecTo(vector);
	}
	perpendicularDistanceTo(vector) /*Returns the shortest length (perpendicular) from any point of this vector to the vector that is passed into function */ {
		return this.perpendicularVectorTo(vector).len();
	}
	rightSidePerpendicular() /*returns perpendicular vector that is on the right side of this vector*/ {
		return new Vec2(this.y, -this.x);
	}
	leftSidePerpendicular() /*returns perpendicular vector that is on the left side of this vector*/ {
		return new Vec2(-this.y, this.x);
	}
	equal(vec) /* check if two vectors are equal */ {
		return this.x == vec.x && this.y == vec.y;
	}
	equalErr(vec, sigma = 0.001) /*check if two vectors are almost equal (use sigma to set the error threshold)*/ {
		return Math.abs(this.x - vec.x) < sigma && Math.abs(this.y - vec.y) < sigma;
	}
	norm() /*normalized vector with length of 1 */ {
		var len = this.len();
		return new Vec2(this.x / len, this.y / len);
	}
	resize(len) /*resized vector to given length */ {
		return this.norm().scale(len);
	}
	scale(fac) /*scaled vector */ {
		return new Vec2(this.x * fac, this.y * fac);
	}
	distance(vec) /*distance between this and argument vector*/ {
		var dx = this.x - vec.x;
		var dy = this.y - vec.y
		return Math.sqrt(dx * dx + dy * dy);
	}
	len() /*length of the vector */ {
		return Math.sqrt(this.lenSqrt());
	}
	lenSqrt() /*non squareroot length of the vector*/ {
		return this.x * this.x + this.y * this.y;
	}
	toArray() /* casts vector to array where x is index 0 and y is index 1 */ {
		return [...this];
	}
	flip() /* flips x and y coordinates */ {
		return new Vec2(this.y, this.x);
	}
	copy() /* returns hard copied vector */ {
		return new Vec2(this.x, this.y);
	}
	sub(vec) /* substracts this-vec */ {
		return new Vec2(this.x - vec.x, this.y - vec.y);
	}
	rotatePointAround(vecPoint, rad) /*rotates vector point around this vector (point) by given radians and returns its new absolute position*/ {
		var rot_vec = this.vecTo(vecPoint);
		var rotatedVec = rot_vec.rotate(rad);
		return this.add(rotatedVec);
	}
	rotate(rad) /*rotates vector by radians*/ {
		var cs = Math.cos(rad);
		var sn = Math.sin(rad);
		return new Vec2(this.x * cs - this.y * sn, this.x * sn + this.y * cs);
	}
	add(vec) /* sums this + vec */ {
		return new Vec2(this.x + vec.x, this.y + vec.y);
	}
	angle(vec) /* returns cosine angle [0-PI] between this and vec */ {
		return Math.acos(this.scalar(vec) / (this.len() * vec.len()));
	}
	fullAngle(vec) /* returns full angle [0-2PI) between this and vec */ {
		return Math.atan2(this.det(vec), this.dot(vec));
	}
	det(vec) /* returns determinant of two vectors */ {
		return this.cross(vec);
	}
	vecTo(vec) /* gets new vector from this to vec */ {
		return vec.sub(this);
	}
	scalar(vec) /* scalar product with this*vec */ {
		return this.x * vec.x + this.y * vec.y;
	}
	dot(vec) /*dot product with this*vec, actual scalar product*/ {
		return this.scalar(vec);
	}
	cross(vec) /* cross product with this x vec */ {
		return this.x * vec.y - this.y * vec.x;
	}
	negate() /* negates the vector */ {
		return new Vec2(-this.x, -this.y);
	}
	toObject() {
		return { x: this.x, y: this.y };
	}
	*[Symbol.iterator]() /*used for unpacking ... if function takes x and y for argument you can unpack your vector easly with function(...vector,other,arguments);  ...vector will turn into x,y arguments! */ {
		yield this.x;
		yield this.y;
	}
}