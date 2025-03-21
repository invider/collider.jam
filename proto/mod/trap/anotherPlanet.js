function anotherPlanet(st) {
    lab.spawn('Planet', augment({
        r:     20 + RND(50),
        dir:   math.rnda(),
        speed: ry(.1) + rnd()*ry(.2),
    }, st))
}
