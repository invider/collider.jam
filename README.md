<p align="center">
<a href="https://github.com/invider/collider.jam">
<img src="res/logo.jpg">
</a></p>

Welcome to Collider.JAM!
========================

<p align="right">
    <i><b>The Fun of the Game Jamming.</b></i>
</p>
<p align="center">
    <img src="res/badge/version.svg">
    <img src="res/badge/license.svg">
    <br><br>
</p>

Collider.JAM is a JavaScript framework for rapid game prototyping and jamming.
It was crafted from experience of multiple game jams we've participated in.

Game prototyping is an art that mixes design, technology and creativity
bounded by time or other limitations.
And we believe it deserves a dedicated tool to address specific needs of a rapidly evolving and changing prototype.

Check out tutorials and code examples below.
_And pixelate reality!_

Table of Contents
-----------------
* [Jam Shell](#jam-shell)
* [Flying Saucer](#flying-saucer)
* [Spaceship](#spaceship)
* [Jam Mixes](#jam-mixes)
* [Explore](#explore)
* [Tutorials](#tutorials)
* [How To](man/HowTo.md)
* [Jamming Games](#jamming-games)
* [How to Contribute](#how-to-contribute)



Jam Shell
---------

To start jamming, we need to install collider.jam shell module globally.
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
(apt on LTS Ubuntu could install a very old version from repos)

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
  +-/lab
      |- background.js - prop with Z = 0 that draws background
      |- saucer.js - the saucer object with evo() and draw() functions
                     this particular file was added by saucer patch
```

Everything placed in /mod/lab will be spawned into an entity on the scene.
An object is exposed by assigning it to module.exports

It is super simple to create something from scratch
(not from existing patch, as we've created the saucer).
Just place js and resource files in the right places.


Spaceship
---------

Let's create a project from an empty mod,
to see how it all comes together.

### collider.jam project init

Get back to your project dir and create a new subdirectory:
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

    // we want the background to be behind everything else,
    // hence the 0 value for Z
    Z: 0,

    draw: function() {
        // draw a solid rectangle filling the whole screen
        ctx.fillStyle = '#151220'
        ctx.fillRect(0, 0, ctx.width, ctx.height)
    }
}
```
We use the standard js canvas 2d context
to fill a dark rectangle.

Notice, that ctx is already in scope.
It is one of the magic tricks of collider.jam.


When specified, the lab frame uses Z to place nodes
according to their Z-value.
We've selected 0 as a background layer just for convenience.
Actually we can use any arbitrary numbers
(e.g. 1001 for the background, 1011 for sprites).

### the ship

Now create _./lab/ship.js_
```
module.exports = {
    Z: 1,

    // place ship in center of the screen
    x: ctx.width/4,
    y: ctx.height/2,

    draw: function() {
        // disable smoothing to preserve pixel-art feel
        // for low-resolution sprites
        ctx.imageSmoothingEnabled = false
    
        // draw the ship image
        ctx.drawImage(res.ship,
            this.x - res.ship.width/2,
            this.y - res.ship.height/2)
    },
}
```
Here we specify Z=1, so the ship
will be in front of the background.

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
* mod - contains additional submods
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

We determine an actual key and rise or clear
corresponding flag inside ship.move[] array.

It is time to modify the ship to follow move commands:
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
* [Blocks]
* [Space Shooter]
* [Platformer]

[How To](man/HowTo.md)
----------------------


Jamming Games
-------------
Check out the following games. All created during various game jams and powered by *_collider.jam_*.

* [300 Hearts for Escape](https://github.com/invider/300-hearts-for-escape) - *[Play](https://github.com/invider/300-hearts-for-escape)* - a survival trading game placed on an isolated island created during Ludum Dare 44.
* [Dream Rocket Boy](https://github.com/invider/dream-rocket-boy) - *[Play](https://github.com/invider/dream-rocket-boy)* - a single screen platformer created for Global Game Jam 2019.
* [Master of Ritual](https://github.com/invider/master-of-ritual) - *[Play](https://ingwar.itch.io/master-or-ritual)* - dungeon crawler from Ludum Dare 43.
* [Xeno Relay Day](https://github.com/invider/xeno-relay-day) - *[Play](https://ingwar.itch.io/xeno-relay-day)* - cosmic relay network puzzler created during Global Game Jam 2018.


Jam Mixes
---------
These are essential modules of the framework:

* [collider.mix](https://github.com/invider/collider.mix) - the most essential mix that includes collider.jam system core (jam.js) and system function definitions.
* [collider-boot.mix](https://github.com/invider/collider-boot.mix) - contains basic samples and patches to mix from.
* [collider-lib.mix](https://github.com/invider/collider-lib.mix) - mixes in various libraries for use (like _lib.math_)
* [collider-ext.mix](https://github.com/invider/collider-ext.mix) - mixes in miscellaneous extentions (sprites, particles etc)
* [collider-hud.mix](https://github.com/invider/collider-hud.mix) - HUD contains collider.jam user interface prototypes.
* [collider-debug.mix](https://github.com/invider/collider-debug.mix) - debug tools

How to Contribute
-----------------

<img src="res/social/discord.svg" alt="discord logo" height="24" width="24"> <a href="https://discord.gg/c8Wmqd">Join our Discord server</a>

<img src="res/social/facebook.png" alt="facebook logo" height="24" width="24"> <a href="https://www.facebook.com/colliderlabs">Like _Collider Labs_ on Facebook</a>

<img src="res/social/twitter.svg" alt="twitter logo" height="24" width="24"> <a href="https://twitter.com/chaostarter">Follow Igor Khotin on Twitter</a>

