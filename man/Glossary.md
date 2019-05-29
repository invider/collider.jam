Collider.JAM Glossary
=====================

* *mix* - a set of data that can contain mods, fixes, samples, patches and pub folders.
* *mod* - represents a complete structure, that can be executed as a separate state or layer.
* *fix* - a subtree that can be _fixed_ into a mod at particular fixing point.
* *unit* - a part of mounted content; can be mod, fix or pub directory.
* *sample* - a mod example you can mix in into your project; usually used to bootstrap the project.
* *patch* - a snippet of functionality you can mix in into your project.
---
* *dna* - a constructor of factory for actors, props and ghosts.
* *lab* -
* *prop* - a lab entity with draw() function, but no evo behaviour; can be a background or some static object.
* *ghost* - a lab entity with evo(dt) function, but no visual representation; can be a gravity or collider.
* *actor* - a lab entity with evo(dt) and draw() functions and usually some state (e.g. x, y, w, h).
* *cue* - a conditional trigger.
* *trap* - a function that traps particular events determined by it's name.
---
* *gameloop* - main loop that handles events, makes scene evolution and draws all visible entities.

