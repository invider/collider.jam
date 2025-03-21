<p align="center">
<a href="https://github.com/invider/collider.jam">
<img src="res/logo.jpg">
</a></p>


Welcome to Collider.JAM!
========================
[collider.land](http://collider.land)
| [start](http://collider.land/start.html)
| [design](http://collider.land/help/#design)
| [reason](http://colliderlabs.com/jam)
| [man](http://collider.land/help/)
| [blog](http://ikhotin.com/posts/)
| [discord](https://discord.gg/kxNnHc2)

<p align="right">
    <i><b>Crafting with joy.</b></i>
</p>

Collider.JAM is a hand-crafted JavaScript framework
for game jamming, creative coding, rapid game prototyping, and beyond.
It was crafted from the experience of multiple game jams we've participated in.

Game prototyping is an art that mixes design, technology, creativity, and hyper-focused productivity.
And we believe it deserves a dedicated tool, capable to address the specific needs of a rapidly evolving prototype.

Visit [collider.land](http://collider.land)
and check out [online docs](http://collider.land/help/).

Look at the sources in [examples](#examples) and [jam games](#jam-games-with-sources).

_Follow the jamming way and pixelate reality!_



Table of Contents
-----------------
* [Install](#install)
* [Draw Shape](#draw-shape)
* [Move Shape](#move-shape)
* [Prototype in Development Mode](#prototype-in-development-mode)
* [Drop Resource](#drop-resource)
* [Handle Mouse](#handle-mouse)
* [Use _jam new_](#use-jam-new)
* [Explore](#explore)
* [How To](man/HowTo.md)
* [Examples](#examples)
* [Jam Games with Sources](#jam-games-with-sources)
* [Jam Mixes](#jam-mixes)
* [How to Contribute](#how-to-contribute)



Install
-------
<p align="right">
    <i><b>Unlock your creativity.</b></i>
</p>

To start jamming, we need to install the collider.jam npm package.
It provides a shell capable of bootstrapping and running game projects.

Make sure you have a relatively modern Node.js installed
by running in the console:

```bash
node --version
> v12.16.1
```
You are OK if it is something like 12+.

If not, visit [Node.js](https://nodejs.org) for the package and installation instructions.

---
Now, to install collider.jam, run:

```
npm install -g collider.jam
```

Or you can get the latest development version directly from GitHub:
```
npm install -g https://github.com/invider/collider.jam.git
```

When installed, check out the version and help:
```
jam version
jam help
```



Draw Shape
---------
<p align="right">
    <i><b>The Fun of the Game Jamming.</b></i>
</p>


Create a folder named 'cirlce.mod' in any convenient place
```
mkdir circle.mod
```

The *.mod* extension is crucial,
since that is how **Collider.JAM** determines
the root of the project.
**Collider.JAM** has particular conventions
on how you name and organize files and directories.

It could be unusual at first, but makes a lot of sense
once you get into the jamming mode.

Create a file *circle.mod/lab.js* and fill in the following lines:

```js
// circle.mod/lab.js

function draw() {
    lineWidth(2)         // set the line width
    stroke(.12, .4, .5)  // color in float HSL
    circle(200, 200, 50) // draw the circle
}
```

Now, run 'jam play' command while inside the *circle.mod* folder:
```
jam play
```

Collider.JAM will start a server and open the default browser
pointing at *[http://localhost:9999]*.
You should see the circle.



Move Shape
----------

Let's make some movement by introducing
variables for the circle position and direction.
We also need the *evo(dt)* function to move it:

```js
// circle.mod/lab.js

// position at the center of the screen
let x = rx(.5)
let y = ry(.5)
let r = 50

// the speed along x and y axises
let dx = 100
let dy = 100

function evo(dt) {
    // dt(delta time) holds the time in seconds passed since the last update
    // make the movement factored by the delta time
    x += dx * dt
    y += dy * dt
}

function draw() {
    lineWidth(2)
    stroke(.12, .4, .5)   // color in float HSL
    circle(x, y, r)
}
```

The problem is that the circle disappears
once it crossed the edge of the screen.

We can introduce some boundaries on x and y,
so our evo(dt) would look like this:
```js
function evo(dt) {
    // make the movement factored by the delta time
    x += dx * dt
    y += dy * dt

    // bounce off the screen edges
    if (x > rx(1)-r && dx > 0) dx *= -1
    else if (x < r && dx < 0) dx *= -1
    if (y > ry(1)-r && dy > 0) dy *= -1
    else if (y < r && dy < 0) dy *= -1
}
```


Find the working example on [GitHub](https://github.com/invider/bits.mix/tree/master/circle.mod).



Prototype in Development Mode
-------------------------------

The most basic *Collider.JAM* command is *jam*:

```
jam
```

It just runs the jam server without opening a web browser,
as *jam play* does.

But when it comes to development, it's much better
to run in the _debug mode_:

```
jam -d
```

That enables hot reload of changes
and help metadata among other things.

Run *Collider.JAM* with -d option,
then open the browser at http://localhost:9999
and try to change circle color or radius.

The changes will be visible in the browser
soon after you saved lib.js.

Also, you can hit F1 and get online help
on everything in the mix, including
Collider.JAM utilities and your code!



Drop Resource
-------------
Let's improve our bouncing circle.

Find a suitable image of a planet with a transparent background,
just like
[this one](https://opengameart.org/sites/default/files/mars_type_planet.png)
from [OpenGameArt](https://opengameart.org).
Or pick any planet from [this procedurally generated collection](https://github.com/invider/procedural-november.pak/tree/main/planets).


Download and drop it into the *circle.mod/res/* folder.

Now add init() and change the draw() function to the following:

```js
function init() {
    this.background = '#000000' // black color in hex RGB
}


function draw() {
    lineWidth(5)
    stroke(.58, .5, .7)
    circle(x, y, r)
    image(res.mars_type_planet, x-r, y-r, 2*r, 2*r)
}
```

We've changed the background to totally black - to match the darkness of space.

Then, we've called the _image()_ function to draw the planet's texture. Notice, that the image resource name must match
the file name without the extension.
It is the way resources are mapped and loaded.

We've preserved the circle and tuned its width and color to resemble
the planet's atmosphere.

Check out the final version on [GitHub](https://github.com/invider/bits.mix/tree/master/planet.mod).



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

Now, the planet will lose 5% of its speed every second.

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
the planet radius and make a 20% speed increase if so.
The *booster* flag is needed for visual feedback.
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

It is time for mouse handling.
Create a folder named *trap* and place
two .js files there - *mouseDown.js* and *mouseUp.js*.

Put in *mouseDown.js*:
```js
// circle.mod/trap/mouseDown.js

function mouseDown(e) {
    lab.boost(e.clientX, e.clientY)
}
```

And *mouseUp.js* is going to be:
```js
// circle.mod/trap/mouseUp.js

function mouseUp() {
    lab.booster = false
}
```

Try it out - the planet is going to accelerate
on mouse click. 

The _jamming way_ is as simple as that!

Just place the files in proper folders,
follow naming conventions and
Collider.JAM will assemble and run
the game for you.



Use _jam new_
-------------
The _new_  command creates various jam objects.
Use it to bootstrap a new mod or create a trap
or a new prototype in */dna*.

Run ```new ls``` to list the possibilities:

```
jam new ls
```

To create a sample mod, just type:
```
jam new mod test
```
That generates the _test.mod_ folder with a bunch
of test objects - a sample _/dna_ prototype,
some entities in _/lab_, a _/lib_ function,
a sample resource, and a couple of traps.
These represent entities you can find in most _Collider.JAM_ games.

The _new_ command shows affected files and generated content.

To create a sample class prototype:

```
jam new class TestEntity
```

Or you can generate mouse-tracking eyes as simple as:
```
jam new eyes
```

Use generated objects as blueprints for your own.
They illustrate _Collider.JAM_ conventions and
a canonical way to implement basic things.



Explore
-------

Check our the following links:

* [collider.land](http://collider.land)
* [start](http://collider.land/start.html)
* [design](http://collider.land/help/#design)
* [reason](http://colliderlabs.com/jam)
* [online help](http://collider.land/help/)
* [blog](http://ikhotin.com/posts/)
* [map](man/Map.md) 
* [glossary](man/Glossary.md) 



Examples
--------

There are a number of useful examples available on github:

* [Bits Mix](https://github.com/invider/bits.mix) - various code snippets.
* [Hello Planet Impact](https://github.com/invider/hello-collider-impact.mod) - asteroid impact simulation.
* [Pong](https://github.com/invider/pong-ce.mod) - classic arcade reimplementation.
* [Vector Zone](https://github.com/invider/vector-zone.mod) - local multiplayer arcade shooter.
* [Game of Life](https://github.com/invider/game-of-life.mod) - Conway's Game of Life.



Jam Games with Sources
----------------------
<p align="right">
    <i><b>Follow the jamming way</b></i>
</p>

Explore the following games. All created during various game jams and powered by *[_Collider.Jam_](http://collider.land)*.

*Note, that older games could use old-style or deprecated features.
But mostly they are OK and show many different ways you can organize a project in Collider.JAM.*

* [Enceladus Dockyards](https://github.com/invider/enceladus-dockyards.mix) - *[Play](https://invadium.itch.io/enceladus-dockyards)* - turn-based space ship battle simulation from GameBoy Jam 8.
* [Jump 'N Loop](https://github.com/invider/jump-n-loop.mod) - *[Play](https://invadium.itch.io/jump-n-loop)* - rythm-based runner from Ludum Dare 47.
* [Station Keeping](https://github.com/invider/station-keeping.mod) - *[Play](https://invadium.itch.io/station-keeping)* - space survival trading simulation from Ludum Dare 46.
* [300 Hearts for Escape](https://github.com/invider/300-hearts-for-escape) - *[Play](https://ingwar.itch.io/300-hearts-for-escape)* - a survival trading game placed on an isolated island created during Ludum Dare 44.
* [Cosmic Rays 'n DNAs](https://github.com/invider/cosmic-rays-n-dnas.mod) - *[Play](https://ingwar.itch.io/rays)* - fix DNA in this arcade Global Game Jam 2020 Entry.
* [Infected Island](https://github.com/invider/roguelike-pak.mod) - 7-Day Roguelike Challenge Entry
* [Xeno Relay Day](https://github.com/invider/xeno-relay-day) - *[Play](https://ingwar.itch.io/xeno-relay-day)* - cosmic relay network puzzler created during Global Game Jam 2018.
* [Dream Rocket Boy](https://github.com/invider/dream-rocket-boy) - *[Play](https://ingwar.itch.io/dream-rocket-boy)* - a single screen platformer created for Global Game Jam 2019.
* [Metro Gang](https://github.com/invider/metro-gang.mix) - *[Play](https://ingwar.itch.io/metro-gang)* - fight against rival gangs for control of the city in this Ludum Dare 45 Entry.
* [Master of Ritual](https://github.com/invider/master-of-ritual) - *[Play](https://ingwar.itch.io/master-or-ritual)* - dungeon crawler from Ludum Dare 43.



Jam Mixes
---------
There are a number of sub-projects **Collider.JAM** depends on.
These contain the actual framework core, utility functions and development features:

* [collider.mix](https://github.com/invider/collider.mix) - the most essential mix that includes collider.jam system core (collider.js) and various library functions and data.
* [collider-dev.mix](https://github.com/invider/collider-dev.mix) - development tools
* [collider-boot.mix](https://github.com/invider/collider-boot.mix) - contains basic samples and patches to mix from.


How to Develop Collider.JAM
---------------------------
The best approach I've found is to clone all _Collider.JAM_ projects into a single folder
and then use ```npm link``` feature to link them together.

Create a global link for each _Collider.JAM_ project by running in the project root:
```
npm link
```

Then install all dependencies between them by specifying package names, e.g. for collider.jam:

```
npm link collider.mix collider-dev.mix collider-boot.mix
```
Note, that all 3 links have to be installed at onces and will be replaced with the next ```npm update```.


How to Contribute
-----------------

Star this repo and join our [Discord server discussions](https://discord.gg/kxNnHc2).

Create something and share it with *#collider.jam* tag.


Find more details in **[How to Contribute](CONTRIBUTING.md)**.

