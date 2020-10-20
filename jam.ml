>>> interactive tutorial (netdrifter)
>>> ghost bot
>>> mission control
    > opinion.mixer
    > masterlist
    > team chat
> jam s/start/getting-started/help start command
> run test by a tag
> show red boot error on 404 resource
> fix first file comment parsing - exclude deep comments as first
> autotag metadata with mod, make it searchable
> metadata for folders as a simple local md file with a special name
> test subfolders in any place, scan mix for all test nodes
> code completion for vim
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
> smart event bindings (plumbing?)
> code completion on vim
> properties inspector
> global search in inspector
> switch between frame view and object view in inspector
> object monitoring on exploration panel
> take units from local package in package mode, ignore optional flag
> refactor HUD style application model
> refactor HUD layout model
> refactor Emitter

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
