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

