# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.12](https://github.com/itssimple/destiny2-overlay/compare/v0.1.11...v0.1.12) (2021-09-04)


### Features

* Updated resources ([42f60b4](https://github.com/itssimple/destiny2-overlay/commit/42f60b49b0ea8123eb217ede8925823dabd629e2))


### Bug Fixes

* Disable cache-breaker for now. It fills your D2 api activity with data. ([bdfd071](https://github.com/itssimple/destiny2-overlay/commit/bdfd071189b03dc616c22839dfc72385e3ec9742))

### [0.1.11](https://github.com/itssimple/destiny2-overlay/compare/v0.1.10...v0.1.11) (2021-09-02)


### Bug Fixes

* Added support for _some_ of the props being disabled in the API ([95d8e77](https://github.com/itssimple/destiny2-overlay/commit/95d8e7798fde89a3db0cdab2cdabf8a0ed0c7626))
* Changed so that the data is loaded asynchronously instead ([a01667c](https://github.com/itssimple/destiny2-overlay/commit/a01667ce1b05166f609f1a4a04ed1ffe8ff7b1c8))
* Disabled automatic opening of overlay on startup. ([0a33891](https://github.com/itssimple/destiny2-overlay/commit/0a338919352039f798cd019757e7dfc61f04d86a))
* Fixed an error when a questItem doesn't have any itemObjectives ([2ed18cc](https://github.com/itssimple/destiny2-overlay/commit/2ed18ccbc261aeabd35064218f994582ea3a24d7))

### [0.1.10](https://github.com/itssimple/destiny2-overlay/compare/v0.1.9...v0.1.10) (2021-08-28)


### Features

* Show tracked items first ([5e614a4](https://github.com/itssimple/destiny2-overlay/commit/5e614a4dec9662f15f85793bb9b364275b5060c0))


### Bug Fixes

* Fixing season rank, so it won't count extra levels until you reach cap of season ([106771f](https://github.com/itssimple/destiny2-overlay/commit/106771fb70904d1fc0f7bc1d84c0ef74a496a8ce))

### [0.1.9](https://github.com/itssimple/destiny2-overlay/compare/v0.1.8...v0.1.9) (2021-08-24)


### Bug Fixes

* Better fix for current season ([c653b9a](https://github.com/itssimple/destiny2-overlay/commit/c653b9a306685ba23f7d2bdc9ad8ca5ab464a905))

### [0.1.8](https://github.com/itssimple/destiny2-overlay/compare/v0.1.7...v0.1.8) (2021-08-22)


### Features

* Fixed cache breaker so it's near instant (well almost), also changed interval to 15 seconds ([5fbf5fd](https://github.com/itssimple/destiny2-overlay/commit/5fbf5fd06712e1622d2e098a8cb44e213c329bd2))

### [0.1.7](https://github.com/itssimple/destiny2-overlay/compare/v0.1.6...v0.1.7) (2021-08-21)


### Features

* Exit the app if the game isn't running when you close the main window ([dd00b6f](https://github.com/itssimple/destiny2-overlay/commit/dd00b6f36aa70329fae0e11838ba96173d79e1e6))

### [0.1.6](https://github.com/itssimple/destiny2-overlay/compare/v0.1.5...v0.1.6) (2021-08-21)


### Features

* CSS styling based on screen size ([ccf2f7a](https://github.com/itssimple/destiny2-overlay/commit/ccf2f7ad9878858ccb7f4cd96b26f143fc336283))

### [0.1.5](https://github.com/itssimple/destiny2-overlay/compare/v0.1.4...v0.1.5) (2021-08-21)


### Features

* Added plugin to handle communication with Bungie instead for possible cache break ([2b059c6](https://github.com/itssimple/destiny2-overlay/commit/2b059c6f09e2dc242da5e73db3733c0afc614f79))

### [0.1.4](https://github.com/itssimple/destiny2-overlay/compare/v0.1.3...v0.1.4) (2021-08-21)


### Bug Fixes

* Changed from Overwolf browser to User browser as default ([9d49f7d](https://github.com/itssimple/destiny2-overlay/commit/9d49f7df005e89aa782396f0c5e92f650e4516bf))

### [0.1.3](https://github.com/itssimple/overwolf-destiny2-overlay/compare/v0.1.2...v0.1.3) (2021-08-17)


### Features

* Added code to save position of windows ([af07a53](https://github.com/itssimple/overwolf-destiny2-overlay/commit/af07a535ae17867a60aac5357248439c9974fb23))
* Added settings for number of items and type of items to track ([ffe2045](https://github.com/itssimple/overwolf-destiny2-overlay/commit/ffe2045a00a9811450c66dd8d3390b7f613b1428))
* Handle settings for visible items and types of tracked items ([2ee86be](https://github.com/itssimple/overwolf-destiny2-overlay/commit/2ee86be6947f889469a4ca28ad7734306b445f98))

### [0.1.2](https://github.com/itssimple/overwolf-destiny2-overlay/compare/v0.1.1...v0.1.2) (2021-08-11)


### Bug Fixes

* It's better if we set the userMembership instead of userMemberships ([a093ae4](https://github.com/itssimple/overwolf-destiny2-overlay/commit/a093ae40cd22c2d72d71fda758270331147e0e0f))
* When we successfully auth, we should try to load data at once as well. ^^; ([77de6bd](https://github.com/itssimple/overwolf-destiny2-overlay/commit/77de6bd25e3fb6114b7d4b6e938cbb72893862ab))

### 0.1.1 (2021-08-11)


### Features

* Added simple way to auth, it's not keeping track of if you're logged in or not right now. Just enabled for testing ([8e07102](https://github.com/itssimple/overwolf-destiny2-overlay/commit/8e071020ea715f3ccbabcbf066dcf070d4bef7b1))
* Pretty much working as it should. ([bc8f23a](https://github.com/itssimple/overwolf-destiny2-overlay/commit/bc8f23ad9175b898adae178dbc1586de9aeb7371))
