// define a square moving with fixed speed into a random direction
// nodes defined in /lab are created automatically during the mod boot up

const speed = ry(.3)        // define the speed as 30% of screen height
const fi = lib.math.rndfi() // pick a random direction

// x and y track the square center coordinates
let x = rx(.5)
let y = ry(.5)

function evo(dt) {
    // move towards fi direction with defined speed
    // warp to screen edges + border
    x = warp(x + cos(fi) * speed * dt, -50, rx(1)+50)
    y = warp(y + sin(fi) * speed * dt, -50, ry(1)+50)
}

function draw() {
    lineWidth(2)
    stroke(.55, .5, .5)        // color in HSL
    rect(x-50, y-50, 100, 100) // square x, y, width and height
}
