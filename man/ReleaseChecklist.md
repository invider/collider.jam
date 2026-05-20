Release Checklist
=================

- [ ] Fill release notes in CHANGELOG 
- [ ] Copy release notes to collider-dev.mix/help.mod/man/pages/release.man 
- [ ] Bump version in js/env file
- [ ] Bump version in package.json for collider.jam (* for every subproject)
- [ ] Make "[!] release..." commits - e.g. "[!] release v0.1.0-WR1"
- [ ] Merge to the master branch (* for every subproject)
- [ ] Update npm packages
- [ ] Move to the release branch (e.g. "git checkout -b ver0.2.0-wr2")
- [ ] Create release tags (e.g. v0.3.0) and bump dependencies to point on these tags (with #v0.3.0)
    - [ ] Tag collider-boot: cd collider-boot.mix; git tag v0.3.0; git push -u origin v0.3.0
    - [ ] Tag collider-mix: cd collider.mix; git tag v0.3.0; git push -u origin v0.3.0
    - [ ] Bump package dependencies in collider-dev.mix to point to the proper tag (e.g. #v0.3.0), npm update, create and push the tag
    - [ ] Bump package dependencies in collider.jam to point to the proper tag (e.g. #v0.3.0), npm update, create and push the tag
- [ ] npm login & [collider.jam/npm publish]
- [ ] Test the release branch

- [ ] Update collider.land artifacts (man pages)
- [ ] Make announcements on all platforms
- [ ] Hold an introductory stream for the release

