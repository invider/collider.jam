Release Checklist
=================

- [ ] Fill release notes in CHANGELOG 
- [ ] Copy release notes to collider-dev.mix/help.mod/man/pages/release.man 
- [ ] Bump version in js/env file
- [ ] Bump version in package.json for collider.jam (* for every subproject)
- [ ] Make "[!] Release..." commits
- [ ] Merge to the master branch (* for every subproject)
- [ ] Update npm packages
- [ ] Move to the release branch (e.g. "ver0.0.11-dr10")
- [ ] Update package dependencies (to point to appropriate branches)
- [ ] Package upgrade
- [ ] create and push release tags
- [ ] npm login & npm push in collider.jam
- [ ] test the release branch

- [ ] update collider.land artifacts (man pages)
- [ ] make announcements on all platforms
- [ ] hold an introductory stream for the release

