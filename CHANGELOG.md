# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.6.2](https://github.com/itssimple/destiny2-overlay/compare/v1.6.1...v1.6.2) (2022-05-26)


### Bug Fixes

* Refresh token when loading character history in case it was expired. ([652593d](https://github.com/itssimple/destiny2-overlay/commit/652593d8b6aa8ad48cefc85006502c4ddb5d2285))
* Use the primaryMembershipId to find which user to load ([2800042](https://github.com/itssimple/destiny2-overlay/commit/2800042d12bed2d982fcff308962f410cb32fabd))

### [1.6.1](https://github.com/itssimple/destiny2-overlay/compare/v1.6.0...v1.6.1) (2022-05-25)


### Bug Fixes

* Change order on how we load things, to make sure that the database is loaded before anything else continues. ([7d091f4](https://github.com/itssimple/destiny2-overlay/commit/7d091f4f4381f2df2593d622ad29d3e60619c45e))
* Use actual membershipType instead of always steam ([f1555ef](https://github.com/itssimple/destiny2-overlay/commit/f1555ef27395adee27dcfed018ce58f551e3cd54))

## [1.6.0](https://github.com/itssimple/destiny2-overlay/compare/v1.5.0...v1.6.0) (2022-05-25)


### Features

* Replace NewRelic with self-hosted Sentry instead. ([1b94d2b](https://github.com/itssimple/destiny2-overlay/commit/1b94d2b05e99a3afbc6af71215635a87d2318263))

## [1.5.0](https://github.com/itssimple/destiny2-overlay/compare/v1.4.0...v1.5.0) (2022-05-24)


### Features

* Added NewRelic browser monitoring, to hopefully catch some bugs ([84ee2d6](https://github.com/itssimple/destiny2-overlay/commit/84ee2d6bf363836d8c366b1334e3bc5be73f72a2))

## [1.4.0](https://github.com/itssimple/destiny2-overlay/compare/v1.3.3...v1.4.0) (2022-05-24)


### Features

* Added debug mode, to increase log verbosity ([75bd341](https://github.com/itssimple/destiny2-overlay/commit/75bd3413bd6d152f92d5f2961fa36290f9e7591f))

### [1.3.3](https://github.com/itssimple/destiny2-overlay/compare/v1.3.2...v1.3.3) (2022-04-21)


### Bug Fixes

* Check for missing parentNodeHashes (it shouldn't try to check missing properties) 🤪 ([6ec4c30](https://github.com/itssimple/destiny2-overlay/commit/6ec4c30d434d222c1f2127d9b1f3b607db697964))

### [1.3.2](https://github.com/itssimple/destiny2-overlay/compare/v1.3.1...v1.3.2) (2022-04-14)


### Bug Fixes

* Accidentally removed disable_auto_dpi_sizing ([cdcd5c5](https://github.com/itssimple/destiny2-overlay/commit/cdcd5c592bed106ef2be4d03f5a478b300faa2e3))

### [1.3.1](https://github.com/itssimple/destiny2-overlay/compare/v1.3.0...v1.3.1) (2022-04-08)


### Bug Fixes

* Try to load activities all the time. Add event for partially loaded activities (to update dashboard live as it updates) ([5270fb4](https://github.com/itssimple/destiny2-overlay/commit/5270fb47c292959ecc9bd556fd8a7a9b329927b7))
* Update GUI as we load activities. ([cfbeb42](https://github.com/itssimple/destiny2-overlay/commit/cfbeb4273cb3c00f1c8668838943d6923d2611d1))

## [1.3.0](https://github.com/itssimple/destiny2-overlay/compare/v1.2.1...v1.3.0) (2022-04-07)


### Features

* Added hotkey to toggle overlay (Default Shift+F10) ([73722f8](https://github.com/itssimple/destiny2-overlay/commit/73722f8b2fbca81cc5f0392624288f210df5e449))
* Character dashboard (WIP) ([c479b9d](https://github.com/itssimple/destiny2-overlay/commit/c479b9d246fb07e5315b481d3af8051bf9c6a08e))

### [1.2.1](https://github.com/itssimple/destiny2-overlay/compare/v1.2.0...v1.2.1) (2022-04-07)


### Bug Fixes

* Fix for loading changelog from the proper path ([132b688](https://github.com/itssimple/destiny2-overlay/commit/132b6884b7df589b3b2ec00ce8f755048f14e020))
* Network connectivity check in main window ([7c9928d](https://github.com/itssimple/destiny2-overlay/commit/7c9928dce5a5e719acc915cabeb01cf802152213))
* Remove gender from last played character to fit into the emblem better. ([ea09954](https://github.com/itssimple/destiny2-overlay/commit/ea09954589b7b71ebb133168a4d263b905ea13ad))

## [1.2.0](https://github.com/itssimple/destiny2-overlay/compare/v1.1.2...v1.2.0) (2022-03-30)


### Features

* Added ability to suppress/enable logging of arguments for eventEmitter ([f8e7044](https://github.com/itssimple/destiny2-overlay/commit/f8e70446d4ac9388e8216f36ca858137e379be15))
* Added lightlevel, and bungie code ([e938500](https://github.com/itssimple/destiny2-overlay/commit/e938500a8e8a01dcb148917fbd89106362c59f00))
* Added support to detect if the app is offline, and then exit it. ([7eebfc3](https://github.com/itssimple/destiny2-overlay/commit/7eebfc3934db76ccb266cf41237a236b6e9aa0d3))


### Bug Fixes

* Clear the interval when we're done ([9febb39](https://github.com/itssimple/destiny2-overlay/commit/9febb39977972b48547e1dd43e83a0e0cdaba6e3))
* If the app was triggered manually (and the user is authenticated), we should open the main window anyway. ([75da965](https://github.com/itssimple/destiny2-overlay/commit/75da965affc09295ccb29d32b438e1486f3df2ed))
* Minimize PNG size for QA-fix ([b1eef55](https://github.com/itssimple/destiny2-overlay/commit/b1eef551169e0ca2f4a186fcf5fa98c8c21f974c))


### Refactoring

* Added extra safeguards against null-references ([f310106](https://github.com/itssimple/destiny2-overlay/commit/f31010698fecf028be7f9f5ee280cf381e4c94b7))
* Remaking most things into TypeScript and ReactJS. Because why not? ([7e544c6](https://github.com/itssimple/destiny2-overlay/commit/7e544c67e04661f852d956e2608d7b6e563fe5f0))

### [1.1.2](https://github.com/itssimple/destiny2-overlay/compare/v1.1.1...v1.1.2) (2022-03-16)


### Bug Fixes

* Don't open the main window all the time, only if the user is not authenticated. ([dbcaae0](https://github.com/itssimple/destiny2-overlay/commit/dbcaae0f1795a649229450319550ccfce56b1dd8))

### [1.1.1](https://github.com/itssimple/destiny2-overlay/compare/v1.1.0...v1.1.1) (2022-03-15)


### Bug Fixes

* Show loading window during game bootup (in case the app hasn't been started before) ([33904bf](https://github.com/itssimple/destiny2-overlay/commit/33904bf8a654871458a23d6ebea63253432e103e))

## [1.1.0](https://github.com/itssimple/destiny2-overlay/compare/v0.1.17...v1.1.0) (2022-03-15)


### Features

* Added loading window, which also handles missing manifest files. ([5fe424f](https://github.com/itssimple/destiny2-overlay/commit/5fe424f9ad522fcf801588c29f867d9cb17b7077))

### [0.1.17](https://github.com/itssimple/destiny2-overlay/compare/v0.1.16...v0.1.17) (2022-02-28)


### Features

* Added a rudimentary loading indicator. ([82aac9c](https://github.com/itssimple/destiny2-overlay/commit/82aac9c8b9b4aff06a81575f49f0ffe459dbc4b0))

### [0.1.16](https://github.com/itssimple/destiny2-overlay/compare/v0.1.15...v0.1.16) (2021-10-16)


### Features

* Added crude version of showing available goals for tracking. Shows triumps as of now ([733a5ee](https://github.com/itssimple/destiny2-overlay/commit/733a5ee08c50aa32d183e18e032d196ae32560dc))
* Added my Destiny 2 UI framework ([fd4e28c](https://github.com/itssimple/destiny2-overlay/commit/fd4e28ca2cfbc29be1b75e13d3d2cb647ef21f27))
* Make sure destiny2.css gets copied as well ([b0f058a](https://github.com/itssimple/destiny2-overlay/commit/b0f058a625eba5bee4f4dd5b466fdd207bacb9bd))


### Refactoring

* Added some more logging ([168504a](https://github.com/itssimple/destiny2-overlay/commit/168504a343fa6da261a656864db23ec11fe11e71))
* Added support for the new CSS ([8c2b86b](https://github.com/itssimple/destiny2-overlay/commit/8c2b86ba5c28aceea52b194c6697dadf8f1cdfbc))
* More logging in the ApiClient to try and solve the initial lag ([cbbb424](https://github.com/itssimple/destiny2-overlay/commit/cbbb42406b4e3d544cbb405787ceae168529d5c5))

### [0.1.15](https://github.com/itssimple/destiny2-overlay/compare/v0.1.14...v0.1.15) (2021-10-07)

### Features

- Added ability to disable tracking of season rank ([e0eb2f6](https://github.com/itssimple/destiny2-overlay/commit/e0eb2f6627f02c61ef2c74607fd2d1a6bc53eb9b))

### Refactoring

- Moved some UI around, it looks better this way ([a67717d](https://github.com/itssimple/destiny2-overlay/commit/a67717dc6e20a7cb4287f8d4f44ee24305d17477))

### [0.1.14](https://github.com/itssimple/destiny2-overlay/compare/v0.1.13...v0.1.14) (2021-10-02)

### Features

- Made some loading asynchronous to speed up the time it took for the UI to get responsive ([07c3aa4](https://github.com/itssimple/destiny2-overlay/commit/07c3aa4822aaf4c41a23e79cdd3a92b6c7faf517))

### Bug Fixes

- Added code to help recover in case of manifests failing to download ([e76cbef](https://github.com/itssimple/destiny2-overlay/commit/e76cbefcd34441c0108772521a0a7094fc7732f5))
- Changed cache breaker, to set lockState correctly, instead of passing itemState as is. ([5c374fc](https://github.com/itssimple/destiny2-overlay/commit/5c374fc5829280234729530890e125d2c5ec5272))

### [0.1.13](https://github.com/itssimple/destiny2-overlay/compare/v0.1.12...v0.1.13) (2021-09-10)

### [0.1.12](https://github.com/itssimple/destiny2-overlay/compare/v0.1.11...v0.1.12) (2021-09-04)

### Features

- Updated resources ([42f60b4](https://github.com/itssimple/destiny2-overlay/commit/42f60b49b0ea8123eb217ede8925823dabd629e2))

### Bug Fixes

- Disable cache-breaker for now. It fills your D2 api activity with data. ([bdfd071](https://github.com/itssimple/destiny2-overlay/commit/bdfd071189b03dc616c22839dfc72385e3ec9742))

### [0.1.11](https://github.com/itssimple/destiny2-overlay/compare/v0.1.10...v0.1.11) (2021-09-02)

### Bug Fixes

- Added support for _some_ of the props being disabled in the API ([95d8e77](https://github.com/itssimple/destiny2-overlay/commit/95d8e7798fde89a3db0cdab2cdabf8a0ed0c7626))
- Changed so that the data is loaded asynchronously instead ([a01667c](https://github.com/itssimple/destiny2-overlay/commit/a01667ce1b05166f609f1a4a04ed1ffe8ff7b1c8))
- Disabled automatic opening of overlay on startup. ([0a33891](https://github.com/itssimple/destiny2-overlay/commit/0a338919352039f798cd019757e7dfc61f04d86a))
- Fixed an error when a questItem doesn't have any itemObjectives ([2ed18cc](https://github.com/itssimple/destiny2-overlay/commit/2ed18ccbc261aeabd35064218f994582ea3a24d7))

### [0.1.10](https://github.com/itssimple/destiny2-overlay/compare/v0.1.9...v0.1.10) (2021-08-28)

### Features

- Show tracked items first ([5e614a4](https://github.com/itssimple/destiny2-overlay/commit/5e614a4dec9662f15f85793bb9b364275b5060c0))

### Bug Fixes

- Fixing season rank, so it won't count extra levels until you reach cap of season ([106771f](https://github.com/itssimple/destiny2-overlay/commit/106771fb70904d1fc0f7bc1d84c0ef74a496a8ce))

### [0.1.9](https://github.com/itssimple/destiny2-overlay/compare/v0.1.8...v0.1.9) (2021-08-24)

### Bug Fixes

- Better fix for current season ([c653b9a](https://github.com/itssimple/destiny2-overlay/commit/c653b9a306685ba23f7d2bdc9ad8ca5ab464a905))

### [0.1.8](https://github.com/itssimple/destiny2-overlay/compare/v0.1.7...v0.1.8) (2021-08-22)

### Features

- Fixed cache breaker so it's near instant (well almost), also changed interval to 15 seconds ([5fbf5fd](https://github.com/itssimple/destiny2-overlay/commit/5fbf5fd06712e1622d2e098a8cb44e213c329bd2))

### [0.1.7](https://github.com/itssimple/destiny2-overlay/compare/v0.1.6...v0.1.7) (2021-08-21)

### Features

- Exit the app if the game isn't running when you close the main window ([dd00b6f](https://github.com/itssimple/destiny2-overlay/commit/dd00b6f36aa70329fae0e11838ba96173d79e1e6))

### [0.1.6](https://github.com/itssimple/destiny2-overlay/compare/v0.1.5...v0.1.6) (2021-08-21)

### Features

- CSS styling based on screen size ([ccf2f7a](https://github.com/itssimple/destiny2-overlay/commit/ccf2f7ad9878858ccb7f4cd96b26f143fc336283))

### [0.1.5](https://github.com/itssimple/destiny2-overlay/compare/v0.1.4...v0.1.5) (2021-08-21)

### Features

- Added plugin to handle communication with Bungie instead for possible cache break ([2b059c6](https://github.com/itssimple/destiny2-overlay/commit/2b059c6f09e2dc242da5e73db3733c0afc614f79))

### [0.1.4](https://github.com/itssimple/destiny2-overlay/compare/v0.1.3...v0.1.4) (2021-08-21)

### Bug Fixes

- Changed from Overwolf browser to User browser as default ([9d49f7d](https://github.com/itssimple/destiny2-overlay/commit/9d49f7df005e89aa782396f0c5e92f650e4516bf))

### [0.1.3](https://github.com/itssimple/destiny2-overlay/compare/v0.1.2...v0.1.3) (2021-08-17)

### Features

- Added code to save position of windows ([af07a53](https://github.com/itssimple/destiny2-overlay/commit/af07a535ae17867a60aac5357248439c9974fb23))
- Added settings for number of items and type of items to track ([ffe2045](https://github.com/itssimple/destiny2-overlay/commit/ffe2045a00a9811450c66dd8d3390b7f613b1428))
- Handle settings for visible items and types of tracked items ([2ee86be](https://github.com/itssimple/destiny2-overlay/commit/2ee86be6947f889469a4ca28ad7734306b445f98))

### Refactoring

- Added more events from places ([e32cb94](https://github.com/itssimple/destiny2-overlay/commit/e32cb944e003e7383e3018c90115d2b6db966ad5))
- Changed some things in the manifest for ads and other things. ([3d60dab](https://github.com/itssimple/destiny2-overlay/commit/3d60dab4b121315201269dd48a41e7c050860624))
- Moved stuff around, added more emitters ([aa930a4](https://github.com/itssimple/destiny2-overlay/commit/aa930a45a7a41dac663b1acdd7f9ac583bd75471))
- Redid some styles ([0da2bde](https://github.com/itssimple/destiny2-overlay/commit/0da2bdedb0a9ee38362fb611737dea68578b63fe))

### [0.1.2](https://github.com/itssimple/destiny2-overlay/compare/v0.1.1...v0.1.2) (2021-08-11)

### Bug Fixes

- It's better if we set the userMembership instead of userMemberships ([a093ae4](https://github.com/itssimple/destiny2-overlay/commit/a093ae40cd22c2d72d71fda758270331147e0e0f))
- When we successfully auth, we should try to load data at once as well. ^^; ([77de6bd](https://github.com/itssimple/destiny2-overlay/commit/77de6bd25e3fb6114b7d4b6e938cbb72893862ab))

### Refactoring

- Hiding the description for now, since they take a lot of space ([6eb2219](https://github.com/itssimple/destiny2-overlay/commit/6eb2219cf884235c7a61b2bac6282e73bb204577))
- Lets do parseInt for window size. ([0cf324d](https://github.com/itssimple/destiny2-overlay/commit/0cf324d7d6253fe1842fc1c3293ff5878cae5993))
