Welcome to Collider.JAM!
========================

Collider.JAM is a JavaScript framework for rapid game prototyping and jamming.
It was crafted from experience of multiple game jams and competitions we've participated in.

Game prototyping is an art that mixes design, technology and creativity.
And we believe it deserves a dedicated tool to cover
the specific needs of rapidly evolving and changing game prototype.

Check out code examples. And pixelate reality!


Jam Shell
---------

First, we need to install collider.jam shell module globally.
The shell can bootstrap and run collider.jam projects.

Make sure you have the latest Node.js installed
by running:

```bash
node --version
```

It should show something like:
```
> v12.3.1
```

If not, visit [Node.js](https://nodejs.org) for installation
instructions and package.

You can use [*brew*](https://brew.sh/) on MacOS X and preferably
[*nvm*](https://github.com/invider/nvm) on Linux
(apt on LTS Ubuntu could install a very old package from repos)

---
Now, to install collider.jam shell, run:

```
npm install -g https://github.com/invider/collider.jam.git
```

When installed, you can try _version_:
```
jam version
```

Use _help_ to check available commands and options:
```
jam help
```


Flying Saucer
-------------

It is time to have something moving on the screen!

Open console in your jam projects folder.

Make new project directory:
```
mkdir test-saucer
cd test-saucer
```

Init the project and patch it with saucer:
```
jam init default
jam patch saucer
```

Now run it:
```
jam play
```

The browser should open a window with a saucer.

----

Now explore the app structure:

```
/mod
  |-/lab
      |- background.js - prop with Z = 0 that draws background
      |- saucer.js - the saucer object with evo() and draw() functions
```

Everything placed in /mod/lab will be spawned into an entity on the scene.
An object is exposed by assigning it to module.exports

It is super simple to create something from scratch
(not from existing patch, as we've created the saucer).
Just place js and resource files in the right places.

Let's do it from very empty mod,
to see how it all comes together.

Flying Ship
-----------

### collider.jam project init

Go back to your project dir and create a new subdirectory:
```
mkdir test-ship
cd test-ship
```

Now we are bootstraping it from an empty mod:
```
jam init empty
```

It has created _./pub/index.html_ which already contains
collider.jam core script.
_./mod_ has also been created with empty res, dna and lib subdirectories.

### assets

Our ship should look somehow,
so go and place an image file _ship.png_
in _./res_ directory.

It will be loaded automatically for you,
just like anything else.

### background

We need a background to fill the scenery.

Create _./lab/background.js_:
```
module.exports = {
    Z: 0,
    draw: function() {
        ctx.fillStyle = '#151220'
        ctx.fillRect(0, 0, ctx.width, ctx.height)
    }
}
```
We use the standard js canvas 2d context
to fill a dark rectangle.

Notice, that ctx is already in scope.
It is one of the magic tricks of collider.jam.

Another property is Z,
which directly specifies Z-index.
Lab uses that to place nodes
according to their Z-value.
We've selected 0 as a background layer.

### the ship

Now create _./lab/ship.js_
```
module.exports = {
    Z: 1,

    x: ctx.width/4,
    y: ctx.height/2,

    draw: function() {
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(res.ship,
            this.x - res.ship.width/2,
            this.y - res.ship.height/2)
    },
}
```
Here we specify Z=1, so the ship
will be in front of background.

The ship should have x and y coordinates.
We use canvas width and height to initialize those.

In draw() function you can take
_res.ship_, which is already loaded,
and draw it on the canvas.

Note, that _res_ is also in scope.
In fact, every major node of _mod_ is in scope:
* _ - current mod
* __ - the parent node
* log - the logging node
* res - the resources node
* lib - the library node
* dna - the node with prototypes, constructors and factories
* env - the game's environment values
* lab - contains all active game entities
* cue - keeps conditional triggers
* trap - contains event trap functions

Now we can check the project. Execute:
```
jam
```

And open browser at _http://localhost:9999_.
You should see your ship on a dark background.

Now we have two static props on the screen -
the ship and the background.
Let's turn ship into an actor
by introducing behavior.

### controls

We need two files in /trap.

_keyDown.js_:
```
module.exports = function(e) {
    switch(e.key) {
    case 'ArrowLeft': lab.ship.move[0] = true; break;
    case 'ArrowUp': lab.ship.move[1] = true; break;
    case 'ArrowRight': lab.ship.move[2] = true; break;
    case 'ArrowDown': lab.ship.move[3] = true; break;
    }
}
```

And _keyUp.js_:
```
module.exports = function(e) {
    switch(e.key) {
    case 'ArrowLeft': lab.ship.move[0] = false; break;
    case 'ArrowUp': lab.ship.move[1] = false; break;
    case 'ArrowRight': lab.ship.move[2] = false; break;
    case 'ArrowDown': lab.ship.move[3] = false; break;
    }
}
```

We determine an actual key and rising or clearing
corresponding flag inside ship.move[] array.

It is time to modify the ship:
```
const SPEED = ctx.height/5

module.exports = {
    Z: 1,

    x: ctx.width/4,
    y: ctx.height/2,
    move: [],

    evo: function(dt) {
        if (this.move[0]) this.x -= SPEED*dt
        if (this.move[2]) this.x += SPEED*dt
        if (this.move[1]) this.y -= SPEED*dt
        if (this.move[3]) this.y += SPEED*dt
    },

    draw: function() {
        ctx.imageSmoothingEnabled = false

        ctx.drawImage(res.ship,
            this.x - res.ship.width/2,
            this.y - res.ship.height/2)
    },
}
```

Now we have the ship's SPEED.
And we have evo(dt) function
that reads the move flags
and makes appropriate move.

Note, that we are multiplying
SPEED * dt, to adjust speed
on actual time passed since
the last evo().

Just update the browser to see the new behavior
(we assume you haven't stopped the server).



Explore
-------

Check our following links:

* [Collider.JAM Map](man/Map.md) 
* [Collider.JAM Glossary](man/Glossary.md) 

Also check out tutorials from the section below.



Tutorials
---------
* [Space Shooter from Scratch](man/Shooter.md)



Jam Prototypes
--------------
Check the source for the following games:

* [300 Hearts for Escape](https://github.com/invider/300-hearts-for-escape) - a survival trading game placed on an isolated island created during Ludum Dare 44
* [Dream Rocket Boy](https://github.com/invider/dream-rocket-boy) - a single screen platformer created for Global Game Jam 2019.


Jam Mixes
---------
These are essential modules of the framework:

* [collider.mix](https://github.com/invider/collider.mix) - the most essential mix that includes collider.jam system core (jam.js) and system function definitions.
* [collider-boot.mix](https://github.com/invider/collider-boot.mix) - contains basic samples and patches to mix from.
* [collider-lib.mix](https://github.com/invider/collider-lib.mix) - mixes in various libraries for use (like _lib.math_)
* [collider-ext.mix](https://github.com/invider/collider-ext.mix) - mixes in miscellaneous extentions (sprites, particles etc)

