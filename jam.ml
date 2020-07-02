> [-] scan problem with frame=file name (e.g. test/test.js)
>>> bot
>>> mission control
>>> interactive tutorial
> core testing
> menu.mod
> animation node
> web-pack like functionality to pak non-mixed packages as libraries
> platform physics
> move metadata parser out of loader and schedule it for latter
> automatic help #tags propagation for all child nodes (e.g. for /cmd or /trap)
> store in local storage help usage info to show the most popular topics section (or on top?)
> path in man should be divided to multiple hyperlinks on different nodes in the hierarchy
> make help url to contain both search predicates and locator - would be more consistent #man
! man metadata can include page sorting priorities as a list of page names (just like a menu)
? move functions like select out of Frame, so there is less chance of name collisions
> mutate function or other object into a frame
> merge patch strategy
> full replace patch strategy
> leave original patch strategy
> before() and after() chaining strategy for function patch
> notify in logs about any patching conflicts (like start.js replacing original mod.start!)
> tribal nodes that automatically spawns particular dna when data is attached to the node
> augment nodes to automatically extend/augment objects as they are attached to a node
> meta actions (like in lua metatables) - do custom stuff on particular fs event (attach, detach etc)
> smart event bindings (plumbing?)

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

