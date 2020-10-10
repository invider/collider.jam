// Planets counter

function draw() {

    // set text output properties
    baseTop()
    alignRight()
    fill(.16, .5, .5)
    font('32px moon')

    // show how many planets are there
    text('Planets: ' + lib.planetCount(), rx(1) - 20, 20)
}
