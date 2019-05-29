Collider.JAM Map
================

_It is all about location, location, location..._

```
mod - core entity that keeps all the code, state and other mods
 |
 |--boot - this node runs first and shows resource booting progress
 |--log - log functions and log telemetry
 |--sys - system functions like augment(), supplement(), after(), before()...
 |--lib - place for utility functions like math.*
 |--res - place for all resources (png, jpg, json, txt, csv etc...)
 |--dna - game objects to spawn; they go to /lab when spawned
 |--env - game environment (e.g. time, status, score, various global flags)
 |--pub - a frame shared among all the mods
 |--lab - place for all alive entities of your game
 |--mod - included submodes
 |   |--menu.mod
 |   |   |--lib
 |   |   |--dna
 |   |   |--log
 |   |   ...
 |   |--score.mod
 |   |   |--lib
 |   |   |--dna
 |   |   |--log
 |   |   ...
 |--cue - timed triggers (e.g. "run fn() every 10 seconds", "run fn() at 15th second of gameplay")
 |--trap - traps for events (like from keyboard, mouse or custom ones)
 |--setup - a function or a frame with functions to setup the game
```

Resource name can have a classifier to specify exactly how we want to load it.
Lets explore some of the possibilities:
```
res
 |-background.png - our background
 |-hero_0.png - our hero has 3 frames in different png files
 |-hero_1.png - we can load them in array for convenience
 |-hero_2.png - end name with _## and images will be organized in array res.hero[]
 |-hero_3.png - can be accessed as res.hero[3]
 |-story.txt - just some backstory here; res.story is a regular String property
 |-message.lines - load text as an array of lines (e.g. res.message[1] will be the second line)
 |-tiles.map32x32.png - a tile object will be created with tiles sized as 32x32 pixels
 |
 |-sfx - sound effects go here
 |  |- jump.wav - play it half-volume with lib.sfx(res.sfx.jump, 0.5)
 |
 |-fnt - place some ttf fonts in this folder - will be loaded and include automatically
 |  |- boo-city.ttf
 |  |- zekton.ttf

```
Note, that fonts and sound effects are placed in subfolders.
That is done for convenience, since we can have many of these
it makes sense to group them.

But you are not required to do that - you can place all
resource files in /res folder.

To trap some events:
```
trap
  |--click - a function to handle mouse click
  |--arrowleftUp.js - triggered when left arrow key is up
  |--arrowrightUp.js - trap for right arrow key
  |--f6Down.js - function will be triggered when f6 is down
  |--keyaUp.js - catch when key A is up
  |--keyDown.js - a function to handle all key down events
  |--keyUp.js - a function to handle all key up events
  |--gameover.js - a custom event thrown with trap('gameover', { details: 'additional info' })
```

And some cues:
```
cue
 |--at0.js - run at 0th second 
 |--at1m30s.js - run at 1 minute 30 seconds of gameplay
 |--at2m.js - run at 2nd minute of gameplay
 |--at5.js - run at 5th second
 |--each1m.js - run each minute
 |--each1s.js - run each second
 |--each5.js - run each 5 seconds
 |--each5s_5times.js - run each 5 secons 5 times, detach the node after
```
