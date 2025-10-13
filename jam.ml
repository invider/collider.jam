> MAML config language (JSON superset) support
> labNode.on('event') -> recursively apply node.onEvent() for all nodes with handlers
> include the parent node __ in context for spawned/local nodes
> expose section grandparent as ___ (e.g. lab === ___ for every single lab node etc...)
> spawn node from compile sources with inclusion of _$ and __ and ___
> remap current mod from _ -> _$ to free _ for local usage (???)
> refactor mod context out of the slide cam
> refactor file caching subsystem, skip parsing/ext-parsing until later
> easy way to replace the root mod canvas to another one and switch the root canvas into a buffering mode (to do shader effects over it)
> notify about unsupported font name in Firefox (starting with numbers?)
> global async support
> PWA support
> uniLab mode - run a specified lab.js file or a specified list of /lab nodes (maybe also /trap, /res etc if possible)

# landing
> refresh collider.land style
> animated landing vaporwave grid
> animated project showcase grid
> itch.io showcase page
> follow on itch button instead of "maillist subscribe"

# docs 
> restructure Readme
> jamming quick start guide
> new ref card
> CONTRIBUTE.md for the project

# bootstrap
> jam quickstart patch/boot
> update jam init, patch & new commands

# dev-tools
> test subfolders in any place, scan mix for all test nodes
> run and visualize test on boot, show error when failed
> option to halt or continue on failed tests
> include test results as a help page
> more sophisticated console parsing and processing/expect/matching utilities
> node preview render in the inspector.mod
> poke() recursively with arguments, so we can drag-n-drop from the /dna inspector to the scene and maybe spawn an instance
> drop() function to drag-n-drop and spawn/create entitites (like a visual spawn())
> object picking to inspect
> pin topic in help #man
> make help url to contain both search predicates and locator - would be more consistent #man
> image node inspector zoom, movement and switch to the next/previous image
> sound node inspector

> core testing
> option to ignore boot up errors (?)
> shiftLight
> shiftSaturation
> extend the .js parser to accept a multi-line constant declaration lists
> split help for length & hypot
> scale should accept one parameter and just duplicate it for simplicity
> run test by a tag

> make slide camera and translation Nodes subMode independent - currently they all are evaluated in the root context and work just there
> fix node inspector loosing focus problem
> fix failed patching of /lab/background node with /lab/background/_background
> fix ambiguous function arguments parsing in help meta (e.g. /lab/control/state include() function)
> fix help parsing of included class methods (e.g. /lab/control/state/GroupState methods description is missing)
> fix !DOCTYPE problem in help.html
> fix layout switch problem in help.html
> fix erroneous main description detection in help (e.g. ghoster.mix/lab/controller)
> fix require() for local path (with no /) and for subMods
> fix .spawn DNA for subMods
> fix missing sys.construct() function while spawning a DNA
> investigate why are we trying to patch help.js on update? Is it an intended behavior?
> show error message on the boot screen (?)

# advanced features
> smart event bindings (plumbing?)
> numbered file prefixes for Z-ordering and load-ordering (e.g. something like 00_first.js, 01_second.js), skip prefixes in actual names!
> refactor samples into a bunch of patches

> pie
> pacman?
> donut?
> optimize and enrich metadata parsing
> refactor tron sample into patch & sample
> viewport node
> name-order node
> jam new .gitignore
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
> show red boot error on 404 resource
> fix first file comment parsing - exclude deep comments as first
> autotag metadata with mod, make it searchable
> metadata for folders as a simple local md file with a special name
> code completion for vim/neovim (?) LSP?
> inspector panel
> node global search
> local life-cycle scripts for mods - to clean, build etc...
> menu.mod
> platform physics
> assert guards
> object pool node
> move metadata parser out of loader and schedule it for latter?
> automatic help #tags propagation for all child nodes (e.g. for /cmd or /trap)
> store in local storage help usage info to show the most popular topics section (or on top?)
> path in man should be divided to multiple hyperlinks on different nodes in the hierarchy
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
> meta actions (like in lua metatables) - do custom stuff on particular fs event (attach, detach etc)
> object pool node
> universal sprite node
> properties inspector
> global search in inspector
> switch between frame view and object view in inspector
> object monitoring on exploration panel
> take units from local package in package mode, ignore optional flag
> refactor HUD style application model
> refactor HUD layout model
> refactor Emitter


### WR2
V always create 2 canvases (2d & 3d)
V spawn in orphan node (for constructor!)
V clear attach event handling (rename onAttached() function to onAttach())
V if main .mod doesn't have trap(), the event still has to chain to the submods
V fix node inspector mouse navigation
V subtrap
V resize() should be chained
V quad
V jam man [optional search string]
V refactor node coordinate transformation functions
V recent commands in the debug console for fast access even after reboot
V onKill() is called 2 times for some reason! (LabFrame calls kill() on itself, should not be happening, redesign kill-path)
V fix @depends for root paths /...
V highlight currently selected node in help
V sync env.time for all mods
V automatically propagate resize signal

### WR1
V include Release Checklist
V collider version must be present in help (and maybe other places?)
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
