Release Checklist
=================

- [ ] Fill release notes in CHANGELOG 
- [ ] Copy release notes to collider-dev.mix/help.mod/man/pages/release.man 
- [ ] Bump version in js/env file
- [ ] Bump version in package.json for collider.jam (* for every subproject)
- [ ] Make "[!] release..." commits - e.g. "[!] release v0.1.0-WR1"
- [ ] Merge to the master branch (* for every subproject)
- [ ] Update npm packages
- [ ] Move to the release branch (e.g. "ver0.0.11-dr10")
- [ ] Update package dependencies (to point to appropriate branches)
- [ ] Package upgrade
- [ ] Create and push release tags
- [ ] npm login & npm push in collider.jam
- [ ] Test the release branch

- [ ] Update collider.land artifacts (man pages)
- [ ] Make announcements on all platforms
- [ ] Hold an introductory stream for the release

