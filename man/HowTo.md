Collider.JAM How To
===================

## Bootstrap from third-party sample

When you want to bootstrap from a sample
which is not included into a standard
bundle, do the following:

Init from empty
```
jam init empty
```

Now install the mix with needed .sample:
```
npm install <mix npm module>
```

Note, that installed mix have to
include the sample you want
named by sample convention (e.g. platformer.sample)

Now run:
```
jam bootstrap platformer
```
Collider.JAM will scan included mixes for available
sample and will mix in needed sample when found.

