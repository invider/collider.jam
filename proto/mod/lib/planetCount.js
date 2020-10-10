// Use /lib to place stateless utility functions like this


// @returns {number} - number of planets in the lab
function planetCount() {
    // select all instances of dna.Planet
    // and return the length of the result
    return lab.select('.Planet').length
}
