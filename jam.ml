### WR1
> include Release Checklist
> new ref card
> jam quickstart patch/boot

> refresh collider.land style
> update jam init, patch & new commands
> numbered file prefixes for Z-ordering and load-ordering (e.g. something like 00_first.js, 01_second.js), skip prefixes in actual names!
> option to ignore boot up errors (?)
> clear attach event handling (split onAttach() function to multiple dedicated ones)
> restructure Readme
> shiftLight
> shiftSaturation
> always create 2 canvases (2d & 3d) and select context on the mod level?
> extend the .js parser to accept a multi-line constant declaration lists
> onKill() is called 2 times for some reason! (LabFrame calls kill() on itself, should not be happening, redesign kill-path)
> split help for length & hypot
> fix ambiguous function arguments parsing in help meta (e.g. /lab/control/state include() function)
> fix help parsing of included class methods (e.g. /lab/control/state/GroupState methods description is missing)
> fix !DOCTYPE problem in help.html
> fix layout switch problem in help.html
> fix erroneous main description detection in help (e.g. ghoster.mix/lab/controller)
> fix @depends for root paths /...
> investigate why are we trying to patch help.js on update? Is is an intended behavior?
> show error message on the boot screen (?)
> poke() recursively with arguments, so we can drag-n-drop from the /dna inspector to the scene and maybe spawn an instance

> pie
> donut?
> pacman?
> quad?
> smart event bindings (plumbing?)
> collider version must be present in help (and maybe other places?)
> image node inspector zoom, movement and switch to the next/previous image
> sound node inspector
> fix node inspector mouse navigation
> fix node inspector loosing focus problem
> optimize and enrich metadata parsing
> refactor tron sample into patch & sample
> viewport node
> name-order node
> jam new .gitignore
> jam man [optional search string]
> jam s/start/getting-started/help start command

>>> mission control
    > hyperframe
    > opinion.mixer
    > masterlist
    > team chat
    > filesharing

>>> interactive tutorial (netdrifter)
>> starfield
>> parallax starfield
>> snake
>> breakout
>> tetris-clone
>> lander
>> missile command
>> pinball
>> pacman
>> tempest
>> qix
>> dino jump (endless runner)
>> flappy bird
>> lines
>>> platformer
>>> dune/warcraft-like
>>> network space shooter
>>> gulf and artificial life forms
>>> ghost bot
> CONTRIBUTE.md for the project
> run test by a tag
> show red boot error on 404 resource
> fix first file comment parsing - exclude deep comments as first
> autotag metadata with mod, make it searchable
> metadata for folders as a simple local md file with a special name
> test subfolders in any place, scan mix for all test nodes
> code completion for vim/neovim (?)
> inspector panel
> node global search
> local life-cycle scripts for mods - to clean, build etc...
> core testing
> menu.mod
> platform physics
> assert guards
> object pool node
> object picking to inspect
> object dragging to spawn
> move metadata parser out of loader and schedule it for latter?
> automatic help #tags propagation for all child nodes (e.g. for /cmd or /trap)
> pin topic in help
> store in local storage help usage info to show the most popular topics section (or on top?)
> path in man should be divided to multiple hyperlinks on different nodes in the hierarchy
> make help url to contain both search predicates and locator - would be more consistent #man
> man metadata to include page sorting priorities as a list of page names (just like a menu)
? move functions like select out of Frame, so there is less chance of name collisions
> mutate function or other object into a frame
> merge patch strategy
> full replace patch strategy
> leave original patch strategy
> before() and after() chaining strategy for function patch
> notify in logs about any patching conflicts (like start.js replacing original mod.start!)
> tribal nodes that automatically spawns particular dna when data is attached to the node
> augment nodes to automatically extend/augment objects as they are attached to a node
> assert guards - make sure we are attaching proper nodes
> routing to place nodes in proper place on spawn with lab.spawn()
> meta actions (like in lua metatables) - do custom stuff on particular fs event (attach, detach etc)
> object pool node
> universal sprite node
> code completion on vim
> properties inspector
> global search in inspector
> switch between frame view and object view in inspector
> object monitoring on exploration panel
> take units from local package in package mode, ignore optional flag
> refactor HUD style application model
> refactor HUD layout model
> refactor Emitter

V include an error sfx in the default package
V multiple moods (styles) for the help system
X render loaded fonts on a hidden canvas to initiate font buffering
V preload fonts
V move hue/saturate out of the root context, introduce "color" util for color manipulation
V rename rndfi() -> rnda()
V rename Frame.selectInstanceOf() -> Frame.selectInstancesOf()
V life
V pong
V fix missing Frame metadata
V z-order node
V lighten
V saturate
V shiftHue
V fix double onSpawn() problem
V fix Frame.kill() and kill logic in general
V animation node
V web-pack like functionality to pak non-mixed packages as libraries
V [-] scan problem with frame=file name (e.g. test/test.js)
V take units from the package or take global units modes
V mod control (pause, pauseAll, hide, hideAll etc)
V optional flag for global units (ignore optional by default)
V sketch mod and sketch mix modes
V .spawn data files for fast setup
V font() should accepts both just [name] and [14px name]
V mod transition
V transform lab node
V dynamic Z
V log(msg) should be a function - not a raw frame
V units.json is loaded from jam or local folder and not from the base
