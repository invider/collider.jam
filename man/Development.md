How to Develop Collider.JAM
===========================


Collider.JAM Project Structure
------------------------------

Collider.JAM follows a _poly-repo_ approach.
It helps to keep well-defined boundaries between components
and establish an extensible foundation.

Most features are built around a small flexible core
following the same composability rules that any game would use.
Meaning that even the low-level systems and components can be
substituded or modified the same way as any of the game-related ones.

The [collider.jam](https://github.com/invadium/collider.jam) repo itself
contains only the ```jam``` command shell that glues the framework together -
installs all dependencies, scans for components, tracks changes,
hosts the development server, and packages distribution.
The actual framework - all JavaScript files that will be running in the browser -
is located in other repositories like
[collider.mix](https://github.com/invadium/collider.mix) and
[collider-dev.mix](https://github.com/invadium/collider-dev.mix).


The basic **Collider.JAM** distribution is shipped with 4 packages,
containing the ```jam``` shell, the ```collider.js``` framework core,
essential systems and libraries, manual pages and vital development and bootstraping tools:

* [collider.jam](https://github.com/invadium/collider.jam) - a command shell that glues everything together
  * [collider.mix](https://github.com/invadium/collider.mix) - the system core (collider.js) and various core libraries
  * [collider-dev.mix](https://github.com/invadium/collider-dev.mix) - development tools 
  * [collider-boot.mix](https://github.com/invadium/collider-boot.mix) - basic samples and patches to mix from.

This distribution package contains everything you need to start with Collider.JAM development.
But it can easily be extended by additional modules.

There is [a blog post](https://ikhotin.com/posts/2026/08/fragments-of-collider.jam/)
exploring the historical background and the reasons behind this structure.



Development Setup
-----------------

The best approach is to clone all _Collider.JAM_ projects into a single folder
(e.g. ```jam/```) and then use ```npm link``` feature to link them together.

### Cloning

There are 4 main projects to clone.

There is also ```geneva.mix```,
a repository that is not a part of _Collider.JAM_ distribution,
but contains tests useful in the framework development,
so it is recommended to clone it as well.

The following script clones all these repos:

.bash
```
mkdir jam
cd jam

git clone git@github.com:invadium/collider.jam.git
git clone git@github.com:invadium/collider.mix.git
git clone git@github.com:invadium/collider-dev.mix.git
git clone git@github.com:invadium/collider-boot.mix.git
git clone git@github.com:invadium/geneva.mix.git
```


### Linking

We don't want _npm_ to use the release packages
from NPM Registry while developing the framework.
To achieve that, link every single repository in the _Collider.JAM_ distribution
globally with ```npm link```command and then use ```npm link [package-names...]``` command
to symlink global packages to the local ./node_modules.

The following sequence of commands demonstrates, how to link the packages globally:

.bash
```
cd collider-boot.mix
npm install
npm link
cd ..

cd collider.mix
npm install
npm link
cd ..

cd collider-dev.mix
npm install
npm link
npm link collider.mix
cd ..

cd collider.jam
npm install
npm link
cd ..
```


Not link local ./node_module dependencies to global symlinks.
Note, that multiple dependencies MUST be linked in a single ```npm link``` command.

.bash
```
cd collider-dev.mix
npm update
npm link collider.mix
cd ..

cd collider.jam
npm update
npm link collider.mix collider-dev.mix collider-boot.mix
cd ..
```

Place the last script inside the ```jam/``` folder.
It MUST be run after every ```npm update``` to relink local modules,
otherwise they will point back to the release versions from _NPM Registry_.



Using Latest Development Version
--------------------------------

When you don't want to deal with Collider.JAM sources,
yet still want to use the latest development version,
install it directly from GitHub with npm:
```
npm install -g https://github.com/invadium/collider.jam.git#develop
```

