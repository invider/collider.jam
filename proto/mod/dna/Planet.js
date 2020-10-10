// Planet dna class
// Use lab.spawn(dna.Planet, {...}) to spawn it

// default values
const df = {
    x: rx(.5),  // center of the screen by default
    y: ry(.5),
    r: 50,
    angle: 0,
    dir: 0,
    speed: ry(.2),
}

class Planet {

    constructor(st) {
        augment(this, df)  // set all default values
        augment(this, st)  // set all initial spawn values
    }

    evo(dt) {
        // make the movement towards {dir} relative to the time passed
        const lx = this.x
        const ly = this.y
        this.x += cos(this.dir) * this.speed * dt
        this.y += sin(this.dir) * this.speed * dt

        // rotate
        this.angle = lib.math.normalizeAngle(this.angle - TAU * 0.1 * dt)

        // bounce from screen edges
        const { x, y, r } = this
        const dx = cos(this.dir)
        const dy = sin(this.dir)

        if (x < r || x > rx(1)-r) {
            this.dir = atan2(dy, -dx)
            this.x = lx
            this.y = ly
        }
        if (y < r || y > ry(1)-r) {
            this.dir = atan2(-dy, dx)
            this.x = lx
            this.y = ly
        }
    }

    draw() {
        const { x, y, r, angle } = this
        save()
        translate(x, y)
        rotate(angle)

        image(res.planet, -r, -r, 2*r, 2*r) // planet texture

        restore()
    }
}
