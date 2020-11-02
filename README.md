<p align="center">
<a href="https://github.com/invider/collider.jam">
<img src="res/logo.jpg">
</a></p>

Welcome to Collider.JAM!
========================
<p align="right">
    <i><b>Crafting with joy.</b></i>
</p>

Collider.JAM is a hand-crafted JavaScript framework
for game jamming, creative coding, rapid game prototyping and beyond.
It was crafted from experience of multiple game jams we've participated in.

Game prototyping is an art that mixes design, technology and creativity
bounded by time or other limitations.
And we believe it deserves a dedicated tool to address specific needs
of a rapidly evolving and changing prototype.

Visit [Collider.JAM Home](http://colliderlabs.com/jam).

Check out tutorials and code examples below.

_And pixelate reality!_

Table of Contents
-----------------
* [Install](#install)
* [Drawing Shape](#drawing-shape)
* [Moving Shape](#moving-shape)
* [Prototyping in Development Mode](#prototyping-in-development-mode)
* [Drop Resource](#drop-resource)
* [Handle Mouse](#handle-mouse)
* [Explore](#explore)
* [How To](man/HowTo.md)
* [Examples](#examples)
* [Jamming Games](#jamming-games)
* [Jam Mixes](#jam-mixes)
* [How to Contribute](#how-to-contribute)



Install
-------
<p align="right">
    <i><b>Unlock your creativity.</b></i>
</p>

To start jamming, we need to install collider.jam npm package.
It provides the sheel to bootstrap and run game projects.

Make sure you have the latest Node.js installed
by running in the console:

```bash
node --version
```

If it is something like 12.16+, you are OK:
```
> v12.16.1
```

If not, visit [Node.js](https://nodejs.org) for installation
instructions and package.

---
Now, to install collider.jam, run:

```
npm install -g collider.jam
```

Or to use the latest development version, install directly from GitHub:
```
npm install -g https://github.com/invider/collider.jam.git#develop
```

When installed, check _version_ and _help_:
```
jam version
jam help
```



Drawing Shape
-------------
<p align="right">
    <i><b>The Fun of the Game Jamming.</b></i>
</p>

Select a folder to keep your game projects in
and create a new subfolder named 'cirlce.mod':
```
mkdir circle.mod
```

The *.mod* extension is crucial here,
since that is how **Collider.JAM** determines
the root of the project.
**Collider.JAM** has particular conventions
on how you name and organize files and directories.

It could be unusual first, but makes a lot of sense
once you get into the jamming mode.

Create a file *circle.mod/lab.js* and fill in the following lines:

```js
function draw() {
    lineWidth(2)         // set the line width
    stroke(.12, .4, .5)  // color in float HSL
    circle(200, 200, 50) // draw the circle
}
```

Now, just run 'jam play' command while in *circle.mod* folder.

```
jam play
```

Collider.JAM will start a server and open default browser
pointing at *[http://localhost:9999]*.



Moving Shape
------------

Let's make some movement by introducing
variables for the circle position and direction.
We also will need the *evo(dt)* function to move it:

```js
// position at the center of the screen
let x = rx(.5)
let y = ry(.5)
let r = 50

// the speed along x and y axises
let dx = 100
let dy = 100

function evo(dt) {
    // make the movement relative to the time passed
    x += dx * dt
    y += dy * dt
}

function draw() {
    background('#101010') // color in hex RGB
    lineWidth(2)
    stroke(.12, .4, .5)   // color in float HSL
    circle(x, y, r)
}
```

Notice the background() function
in the beginning of draw().
Since we are moving the cirlce now,
the background needs to be refilled
to clean up the previous frame.

The problem is that the circle dissapears
once it crossed the edge of the screen.

We can introduce some boundaries on x and y,
so our evo(dt) would look like this:
```js
function evo(dt) {
    // make the movement relative to the time passed
    x += dx * dt
    y += dy * dt

    // screen edge boundaries
    if (x > rx(1)-r && dx > 0) dx *= -1
    else if (x < r && dx < 0) dx *= -1
    if (y > ry(1)-r && dy > 0) dy *= -1
    else if (y < r && dy < 0) dy *= -1
}
```

Find the working example on [GitHub](https://github.com/invider/bits.mix/tree/master/circle.mod).



Prototyping in Development Mode
-------------------------------

The most rudimental *Collider.JAM* command is *jam*:

```
jam
```

It just runs the jam server without opening a web browser,
as *jam play* does.

But it is more convenient to run in development mode
while developing:

```
jam -d
```

That enables code hot reload and help metadata
among other things.

Run *Collider.JAM* with -d option,
open browser at http://localhost:9999
and try to change circle color or radius.

The changes will be applied in the browser
after you saved lib.js.



Drop Resource
-------------
Let's spice up our bouncing circle a little.

Find a suitable image of a planet with transparent background,
just like this one from OpenGameArt:
https://opengameart.org/sites/default/files/mars_type_planet.png

Download and drop it into *circle.mod/res/* folder.

Now change the draw() function to the following:

```js
function draw() {
    background('#000000')
    lineWidth(5)
    stroke(.58, .5, .7)
    circle(x, y, r)
    image(res.mars_type_planet, x-r, y-r, 2*r, 2*r)
}
```

We've changed the background to totally black,
to match the darkness of space.
Then, we've added the image function to draw the planet texture. Notice, that the image name must match
the file name without the extension.

In this example we've left the circle
and tune it width and color to resemble
the planet's atmosphere.

Check out working example on [GitHub](https://github.com/invider/bits.mix/tree/master/planet.mod).



Handle Mouse
------------
Suppose our planet is slowing down.

Add the following function to reduce the speed:
```js
function slowDown(dt) {
    dx *= 1 - 0.05*dt
    dy *= 1 - 0.05*dt
}
```

And call it from evo(dt) like that:
```js
function evo(dt) {
    ...
    slowDown(dt)
}
```

Now, the planet will loose 5% of it's speed
every second.

But we want it to accelerate on click,
so we will include boost() function:
```js
function boost(mouseX, mouseY) {
    if (!this.booster && dist(x, y, mouseX, mouseY) <= r) {
        dx *= 1.2
        dy *= 1.2
        this.booster = true
    }
}
```

We are checking if the mouse coordinates are within
the planet radius and make 20% speed increase if so.
The *booster* flag is needed for the visual feedback.
We want to show the player a hint
that the boost has actually happened.

For example, we can change the atmosphere color
in draw():
```js
function draw() {
    background('#000000')
    lineWidth(5)
    if (this.booster) stroke(.05, .4, .6)
    else stroke(.58, .5, .7)
    circle(x, y, r)
    image(res.mars_type_planet, x-r, y-r, 2*r, 2*r)
}
```

It is time for the mouse handling.
Create a folder named *trap* and place
two .js files there - *mouseDown.js* and *mouseUp.js*.

Put in *mouseDown.js*:
```js
function mouseDown(e) {
    lab.boost(e.clientX, e.clientY)
}
```

And *mouseUp.js* is going to be:
```js
function mouseUp() {
    lab.booster = false
}
```

Try it out - the planet is going to accelerate
on mouse click. 

So it is all as simple as that!

Just place the files in proper folders,
follow naming conventions and
Collider.JAM will assemble and run
the game for you.



Explore
-------

Check our following links:

* [Collider.JAM Map](man/Map.md) 
* [Collider.JAM Glossary](man/Glossary.md) 
* [How To](man/HowTo.md)



Examples
--------

Check out following examples:

* [Bits Mix](https://github.com/invider/bits.mix) - various code snippets
* [Hello Planet Impact](https://github.com/invider/hello-collider-impact.mod) - asteroid impact simulation
* [Game of Life](https://github.com/invider/game-of-life.mod) - Conway's Game of Life



Jamming Games
-------------
<p align="right">
    <i><b>Follow the jamming way</b></i>
</p>

Check out the following games. All created during various game jams and powered by *_collider.jam_*.

* [Station Keeping](https://github.com/invider/station-keeping.mod) - *[Play](https://invadium.itch.io/station-keeping)* - space survival trading simulation from Ludum Dare 46
* [300 Hearts for Escape](https://github.com/invider/300-hearts-for-escape) - *[Play](https://ingwar.itch.io/300-hearts-for-escape)* - a survival trading game placed on an isolated island created during Ludum Dare 44.
* [Cosmic Rays 'n DNAs](https://github.com/invider/cosmic-rays-n-dnas.mod) - *[Play](https://ingwar.itch.io/rays)* - fix DNA in this arcade Global Game Jam 2020 Entry.
* [Infected Island](https://github.com/invider/roguelike-pak.mod) - 7-Day Roguelike Challenge Entry
* [Xeno Relay Day](https://github.com/invider/xeno-relay-day) - *[Play](https://ingwar.itch.io/xeno-relay-day)* - cosmic relay network puzzler created during Global Game Jam 2018.
* [Dream Rocket Boy](https://github.com/invider/dream-rocket-boy) - *[Play](https://ingwar.itch.io/dream-rocket-boy)* - a single screen platformer created for Global Game Jam 2019.
* [Metro Gang](https://github.com/invider/metro-gang.mix) - *[Play](https://ingwar.itch.io/metro-gang)* - fight against rival gangs for control of the city in this Ludum Dare 45 Entry.
* [Master of Ritual](https://github.com/invider/master-of-ritual) - *[Play](https://ingwar.itch.io/master-or-ritual)* - dungeon crawler from Ludum Dare 43.



Jam Mixes
---------
There are a few modules **Collider.JAM** depends on:

* [collider.mix](https://github.com/invider/collider.mix) - the most essential mix that includes collider.jam system core (jam.js) and various library functions and data.
* [collider-boot.mix](https://github.com/invider/collider-boot.mix) - contains basic samples and patches to mix from.
* [collider-debug.mix](https://github.com/invider/collider-debug.mix) - debug tools



How to Contribute
-----------------

<iframe src="https://ghbtns.com/github-btn.html?user=invider&repo=collider.jam&type=star&count=true&size=large" frameborder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe>

Join our [Discord server discussions](https://discord.gg/kxNnHc2).

Create something and share it with #collider.jam tag.

More details on [how to contribute](CONTRIBUTING.md).

