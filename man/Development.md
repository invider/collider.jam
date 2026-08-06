How to Develop Collider.JAM
===========================

Jam Mixes
---------
There are a number of sub-projects **Collider.JAM** depends on.
These contain the actual framework core, utility functions and development features:

* [collider.mix](https://github.com/invadium/collider.mix) - the most essential mix that includes collider.jam system core (collider.js) and various library functions and data.
* [collider-dev.mix](https://github.com/invadium/collider-dev.mix) - development tools
* [collider-boot.mix](https://github.com/invadium/collider-boot.mix) - contains basic samples and patches to mix from.


Development Setup
-----------------

The best approach I've found is to clone all _Collider.JAM_ projects into a single folder
and then use ```npm link``` feature to link them together.

Create a global link for each _Collider.JAM_ project by running in the project root:
```
npm link
```

Then install all dependencies between them by specifying package names, e.g. for collider.jam:

```
npm link collider.mix collider-dev.mix collider-boot.mix
```
Note, that all 3 links have to be installed at onces and will be replaced with the next ```npm update```.



Using Development Version
-------------------------

Or you can get the latest development version with npm directly from GitHub:
```
npm install -g https://github.com/invadium/collider.jam.git
```

