function DestinyApiClient() {
  const apiToken = "c32cd3cb4eb94a84acc468a1cf333dac";

  /**
   * @description Used for the base URL of content, like images and such.
   */
  const destinyBaseUrl = "https://www.bungie.net";

  const authGatewayUrl = "https://o2g.itssimple.se";

  /**
   * @description The API endpoint for the Destiny 2 API.
   */
  const destinyApiUrl = "https://www.bungie.net/Platform";

  /**
   * @description The datatypes we are interested in.
   */
  const destinyDataTypes = [
    "DestinyActivityTypeDefinition",
    "DestinyActivityDefinition",
    "DestinyArtifactDefinition",
    "DestinyChecklistDefinition",
    "DestinyClassDefinition",
    "DestinyDestinationDefinition",
    "DestinyFactionDefinition",
    "DestinyGenderDefinition",
    "DestinyItemCategoryDefinition",
    "DestinyItemTierTypeDefinition",
    "DestinyInventoryBucketDefinition",
    "DestinyInventoryItemDefinition",
    "DestinyMedalTierDefinition",
    "DestinyMetricDefinition",
    "DestinyMilestoneDefinition",
    "DestinyObjectiveDefinition",
    "DestinyPlaceDefinition",
    "DestinyPresentationNodeDefinition",
    "DestinyProgressionDefinition",
    "DestinyRaceDefinition",
    "DestinyRecordDefinition",
    "DestinySeasonDefinition",
    "DestinySeasonPassDefinition",
    "DestinyStatDefinition",
    "DestinyTraitDefinition",
  ];

  this.lastVersion = null;
  this.cachedManifest = null;

  this.destinyDataDefinition = {};

  this.randomState = null;

  this.profile = null;
  this.userMembership = null;

  this.trackedGoals = [];

  this.checkManifestVersion = async function () {
    return new Promise(async function (resolve, reject) {
      let manifest = await self.getManifest();
      if (manifest.Response.version !== self.lastVersion) {
        /* Currently cached data is older than 60 minutes, so we clear it. */
        await db.removeItem("lastManifestUpdate");
        await db.removeItem("manifest");
        await db.removeItem("manifestVersion");

        for (let dataType of destinyDataTypes) {
          await db.removeItem(`destinyContent-${dataType}`);
        }

        self.lastVersion = manifest.Response.version;
        self.cachedManifest = manifest.Response;

        db.setItem("manifestVersion", self.lastVersion);
        db.setItem("manifest", JSON.stringify(self.cachedManifest));
        db.setItem("lastManifestUpdate", Date.now());

        await self.loadDestinyContentData();

        resolve({ updatedManifest: true, version: self.lastVersion });
        return;
      }
      resolve({ updatedManifest: false, version: self.lastVersion });
    });
  };

  this.getManifest = async function () {
    let lastManifestUpdate = await db.getItem("lastManifestUpdate");

    if (
      lastManifestUpdate !== null &&
      Date.now() - lastManifestUpdate < 60000 * 60
    ) {
      if ((await db.getItem("manifest")) !== null) {
        return { Response: JSON.parse(await db.getItem("manifest")) };
      }
    }

    return new Promise(function (resolve, reject) {
      let xhr = getXMLHttpRequestClient(
        "GET",
        `${destinyApiUrl}/Destiny2/Manifest/`
      );

      xhr.onload = function () {
        if (xhr.status === 200) {
          let manifest = JSON.parse(xhr.responseText);
          if (manifest.ErrorStatus == "Success") {
            db.setItem("lastManifestUpdate", Date.now());
            db.setItem("manifest", JSON.stringify(manifest.Response));
            resolve(manifest);
          } else {
            reject(manifest);
          }
        } else {
          reject(xhr.statusText);
        }
      };

      xhr.onerror = function () {
        reject(xhr.statusText);
      };

      xhr.send(null);
    });
  };

  async function loadDataFromStorage() {
    let _cachedManifest = await db.getItem("manifest");
    if (_cachedManifest !== null) {
      self.cachedManifest = JSON.parse(_cachedManifest);
    }

    if ((await db.getItem("manifestVersion")) !== null) {
      self.lastVersion = await db.getItem("manifestVersion");
    }

    for (let dataType of destinyDataTypes) {
      let data = await db.getItem(`destinyContent-${dataType}`);
      if (data !== null) {
        self.destinyDataDefinition[dataType] = JSON.parse(data);
      }
    }

    if ((await db.getItem("destiny-profile")) !== null) {
      self.profile = JSON.parse(await db.getItem("destiny-profile"));
    }

    if ((await db.getItem("destiny-userMembership")) !== null) {
      self.userMembership = JSON.parse(
        await db.getItem("destiny-userMembership")
      );
    }
  }

  this.loadDestinyContentData = async function () {
    for (let dataType of destinyDataTypes) {
      await loadDestinyContentDataType(dataType);
    }
  };

  /**
   * @description Loads the manifest and then loads the content data.
   */
  async function loadDestinyContentDataType(dataType) {
    let manifest = await self.getManifest();

    return new Promise(async function (resolve, reject) {
      let xhr = getXMLHttpRequestClient(
        "GET",
        `${destinyBaseUrl}${manifest.Response.jsonWorldComponentContentPaths.en[dataType]}`
      );

      xhr.onload = function () {
        if (xhr.status === 200) {
          let contentJson = JSON.parse(xhr.responseText);

          self.destinyDataDefinition[dataType] = contentJson;
          db.setItem(`destinyContent-${dataType}`, JSON.stringify(contentJson));

          resolve(contentJson);
        } else {
          reject(xhr.statusText);
        }
      };

      xhr.onprogress = function (event) {
        console.log(
          `Downloaded ${event.loaded} of ${event.total} bytes for: ${xhr.responseURL}`
        );
      };

      xhr.onerror = function () {
        reject(xhr.statusText);
      };

      xhr.send(null);
    });
  }

  function convertObjectToArray(object) {
    return Object.keys(object).map((key) => {
      return object[key];
    });
  }

  /**
   * @description Gets a primed XHR client, with the correct headers.
   */
  function getXMLHttpRequestClient(method, url, bearerToken = null) {
    var xhr = new XMLHttpRequest();

    xhr.open(method, url);

    xhr.setRequestHeader(
      "X-User-Agent",
      "Destiny 2 Goal Tracker AppId/41664 (+d2goaltracker@itssimple.se)"
    );

    xhr.setRequestHeader("X-API-Key", apiToken);

    if (bearerToken !== null) {
      xhr.setRequestHeader("Authorization", "Bearer " + bearerToken);
    }

    return xhr;
  }

  this.getAuthenticationUrl = function () {
    this.randomState = (Math.random() * 10000).toString(32);
    return `${authGatewayUrl}/authenticate/destiny2?state=${this.randomState}`;
  };

  function handleTokenResponse(tokenResponse) {
    if (typeof tokenResponse.error == "undefined") {
      // This means we have our token, lets save it!
      db.setItem("destinyToken", tokenResponse.access_token);
      db.setItem("destinyRefreshToken", tokenResponse.refresh_token);
      db.setItem(
        "destinyExpires",
        Date.now() + tokenResponse.expires_in * 1000
      );
      db.setItem(
        "destinyRefreshTokenExpires",
        Date.now() + tokenResponse.refresh_expires_in * 1000
      );
    }
  }

  this.getToken = function (state, code) {
    if (state != this.randomState) {
      // We're getting a bad state, so we'll just return null here.
      return null;
    }

    return new Promise((resolve, reject) => {
      let tokenRequest = getXMLHttpRequestClient(
        "POST",
        `${authGatewayUrl}/token/destiny2`
      );
      tokenRequest.setRequestHeader(
        "Content-Type",
        "application/json;charset=UTF-8"
      );

      tokenRequest.onload = function () {
        if (tokenRequest.status === 200) {
          let tokenResponse = JSON.parse(tokenRequest.responseText);

          handleTokenResponse(tokenResponse);
          resolve(tokenResponse);
          return;
        }

        reject(tokenRequest.responseText);
      };

      tokenRequest.onerror = function () {
        reject(tokenRequest.statusText);
      };

      tokenRequest.send(JSON.stringify({ code: code }));
    });
  };

  this.refreshToken = async function () {
    return new Promise(async (resolve, reject) => {
      let tokenRequest = getXMLHttpRequestClient(
        "POST",
        `${authGatewayUrl}/refresh/destiny2`
      );
      tokenRequest.setRequestHeader(
        "Content-Type",
        "application/json;charset=UTF-8"
      );

      tokenRequest.onload = function () {
        if (tokenRequest.status === 200) {
          let tokenResponse = JSON.parse(tokenRequest.responseText);

          handleTokenResponse(tokenResponse);
          resolve(tokenResponse);
          return;
        }

        reject(tokenRequest.responseText);
      };

      tokenRequest.onerror = function () {
        reject(tokenRequest.responseText);
      };

      tokenRequest.send(
        JSON.stringify({
          refresh_token: await db.getItem("destinyRefreshToken"),
        })
      );
    });
  };

  async function refreshTokenIfExpired() {
    let expires = await db.getItem("destinyExpires");

    if (expires < Date.now()) {
      await self.refreshToken();
    }
  }

  async function getUserToken() {
    return await db.getItem("destinyToken");
  }

  this.getUserMemberships = async function () {
    await refreshTokenIfExpired();

    return new Promise(async (resolve, reject) => {
      let xhr = getXMLHttpRequestClient(
        "GET",
        `${destinyApiUrl}/User/GetMembershipsForCurrentUser/`,
        await getUserToken()
      );

      xhr.onload = function () {
        if (xhr.status === 200) {
          let memberships = JSON.parse(xhr.responseText);

          db.setItem(
            "destiny-userMembership",
            JSON.stringify(memberships.Response)
          );

          this.userMemberships = memberships.Response;

          resolve(memberships.Response);
        } else {
          reject(xhr.statusText);
        }
      };

      xhr.onerror = function () {
        reject(xhr.statusText);
      };

      xhr.send(null);
    });
  };

  const profileComponents = {
    None: 0,
    Profiles: 100,
    VendorReceipts: 101,
    ProfileInventories: 102,
    ProfileCurrencies: 103,
    ProfileProgression: 104,
    PlatformSilver: 105,
    Characters: 200,
    CharacterInventories: 201,
    CharacterProgressions: 202,
    CharacterRenderData: 203,
    CharacterActivities: 204,
    CharacterEquipment: 205,
    ItemInstances: 300,
    ItemObjectives: 301,
    ItemPerks: 302,
    ItemRenderData: 303,
    ItemStats: 304,
    ItemSockets: 305,
    ItemTalentGrids: 306,
    ItemCommonData: 307,
    ItemPlugStates: 308,
    ItemPlugObjectives: 309,
    ItemReusablePlugs: 310,
    Vendors: 400,
    VendorCategories: 401,
    VendorSales: 402,
    Kiosks: 500,
    CurrencyLookups: 600,
    PresentationNodes: 700,
    Collectibles: 800,
    Records: 900,
    Transitory: 1000,
    Metrics: 1100,
    StringVariables: 1200,
  };

  this.getUserProfile = async function (membershipId) {
    let interestingComponents = [
      profileComponents.Profiles,
      profileComponents.ProfileProgression,
      profileComponents.Characters,
      profileComponents.CharacterProgressions,
      profileComponents.CharacterActivities,
      profileComponents.ItemObjectives,
      profileComponents.ItemPlugObjectives,
      profileComponents.Metrics,
      profileComponents.Records,
    ];

    await refreshTokenIfExpired();

    return new Promise(async (resolve, reject) => {
      let xhr = getXMLHttpRequestClient(
        "GET",
        `${destinyApiUrl}/Destiny2/3/Profile/${membershipId}/?components=${interestingComponents.join(
          ","
        )}&_=${new Date().getTime()}`,
        await getUserToken()
      );

      xhr.onload = function () {
        if (xhr.status === 200) {
          let profile = JSON.parse(xhr.responseText);

          db.setItem("destiny-profile", JSON.stringify(profile.Response));

          this.profile = profile.Response;

          resolve(profile.Response);
        } else {
          reject(xhr.statusText);
        }
      };

      xhr.onerror = function () {
        reject(xhr.statusText);
      };

      xhr.send(null);
    });
  };

  this.getLastPlayedCharacter = async function (forceRefresh = false) {
    let _profile = self.profile;

    if (forceRefresh) {
      _profile = null;
    }

    if (self.userMembership === null) {
      return null;
    }

    if (_profile == null && self.userMembership !== null) {
      _profile = await self.getUserProfile(
        self.userMembership.destinyMemberships[0].membershipId
      );
    }

    let characters = [];

    for (let char of _profile.profile.data.characterIds) {
      characters.push(_profile.characters.data[char]);
    }

    let _last = characters.sort((a, b) =>
      a.dateLastPlayed > b.dateLastPlayed ? -1 : 1
    )[0];

    let lastPlayedCharacter = {
      characterInfo: _last,
      characterProgression:
        _profile.characterProgressions.data[_last.characterId],
      characterActivities: _profile.characterActivities.data[_last.characterId],
      characterUninstancedItemComponents:
        _profile.characterUninstancedItemComponents[_last.characterId],
      profileProgression: _profile.profileProgression.data,
      metrics: _profile.metrics.data.metrics,
      itemComponents: _profile.itemComponents,
      records: _profile.profileRecords.data,
    };

    return lastPlayedCharacter;
  };

  this.getCurrentSeason = async function () {
    await self.checkManifestVersion();

    let utcNow = GetUTCDate();

    let seasonArray = convertObjectToArray(
      self.destinyDataDefinition.DestinySeasonDefinition
    );

    return seasonArray.find(
      (i) =>
        Date.parse(i.startDate) <= utcNow.getTime() &&
        Date.parse(i.endDate) >= utcNow.getTime()
    );
  };

  const recordState = {
    None: 0,
    RecordRedeemed: 1,
    RewardUnavailable: 2,
    ObjectiveNotCompleted: 4,
    Obscured: 8,
    Invisible: 16,
    EntitlementUnowned: 32,
    CanEquipTitle: 64,
  };

  this.getNamedDataObject = async function (forceRefresh = false) {
    let _lastPlayer = await self.getLastPlayedCharacter(forceRefresh);

    if (_lastPlayer == null) {
      return null;
    }

    let namedDataObject = {
      ..._lastPlayer,
    };

    let statKeys = Object.keys(namedDataObject.characterInfo.stats);

    for (let statKey of statKeys) {
      namedDataObject.characterInfo.stats[statKey] = {
        statName:
          self.destinyDataDefinition.DestinyStatDefinition[statKey]
            .displayProperties.name,
        statDescription:
          self.destinyDataDefinition.DestinyStatDefinition[statKey]
            .displayProperties.description,
        statIcon:
          self.destinyDataDefinition.DestinyStatDefinition[statKey]
            .displayProperties.icon,
        statValue: namedDataObject.characterInfo.stats[statKey],
      };
    }

    let metricKeys = Object.keys(namedDataObject.metrics);

    for (let metricKey of metricKeys) {
      namedDataObject.metrics[metricKey] = {
        ...namedDataObject.metrics[metricKey],
        metricName:
          self.destinyDataDefinition.DestinyMetricDefinition[metricKey]
            .displayProperties.name,
        metricDescription:
          self.destinyDataDefinition.DestinyMetricDefinition[metricKey]
            .displayProperties.description,
        metricIcon:
          self.destinyDataDefinition.DestinyMetricDefinition[metricKey]
            .displayProperties.icon,
      };
    }

    let recordKeys = Object.keys(namedDataObject.records.records);
    for (let recordKey of recordKeys) {
      namedDataObject.records.records[recordKey] = {
        ...namedDataObject.records.records[recordKey],
        recordName:
          self.destinyDataDefinition.DestinyRecordDefinition[recordKey]
            .displayProperties.name,
        recordDescription:
          self.destinyDataDefinition.DestinyRecordDefinition[recordKey]
            .displayProperties.description,
        recordIcon:
          self.destinyDataDefinition.DestinyRecordDefinition[recordKey]
            .displayProperties.icon,
      };
    }

    namedDataObject = self.mapHashesToDefinitionsInObject(namedDataObject);

    return namedDataObject;
  };

  this.mapHashesToDefinitionsInObject = function (object) {
    let _objectCopy = { ...object };

    let keys = Object.keys(_objectCopy);
    for (let key of keys) {
      let _type = typeof _objectCopy[key];
      let _field = _objectCopy[key];

      if (Array.isArray(_field)) {
        for (let x = 0; x < _field.length; x++) {
          let arrItem = _field[x];
          if (typeof arrItem === "object") {
            _field[x] = self.mapHashesToDefinitionsInObject(arrItem);
          } else {
            _field[x] = arrItem;
          }
        }
      } else if (_type === "object" && _field !== null) {
        _objectCopy[key] = self.mapHashesToDefinitionsInObject(
          _objectCopy[key],
          _objectCopy
        );
      } else {
        if (key.indexOf("Hash") > -1 && _type === "number" && _field > 0) {
          let _hashType = key
            .replace("Hash", "")
            .replace("current", "")
            .toLowerCase();

          let dataType = destinyDataTypes.find(
            (i) =>
              i.toLowerCase() == `Destiny${_hashType}Definition`.toLowerCase()
          );
          let definitionData = self.destinyDataDefinition[dataType];
          if (
            definitionData &&
            definitionData[_field] &&
            definitionData[_field].displayProperties
          ) {
            if (
              definitionData[_field].displayProperties.name &&
              definitionData[_field].displayProperties.name.length > 0
            ) {
              _objectCopy[`${_hashType}Name`] =
                definitionData[_field].displayProperties.name;
            }

            if (
              definitionData[_field].displayProperties.description &&
              definitionData[_field].displayProperties.description.length > 0
            ) {
              _objectCopy[`${_hashType}Description`] =
                definitionData[_field].displayProperties.description;
            }

            if (
              definitionData[_field].displayProperties.icon &&
              definitionData[_field].displayProperties.icon.length > 0
            ) {
              _objectCopy[`${_hashType}Icon`] =
                definitionData[_field].displayProperties.icon;
            }

            if (
              definitionData[_field].progressDescription &&
              definitionData[_field].progressDescription.length > 0
            ) {
              _objectCopy[`${_hashType}ProgressDescription`] =
                definitionData[_field].progressDescription;
            }
          }
        }
        _objectCopy[key] = _field;
      }
    }

    return _objectCopy;
  };

  this.getTrackableData = async function (forceRefresh = false) {
    let namedObject = await self.getNamedDataObject(forceRefresh);

    if (namedObject == null) {
      return null;
    }

    let currentSeason = await self.getCurrentSeason();

    let seasonDefinition =
      self.destinyDataDefinition.DestinySeasonDefinition[currentSeason.hash];
    let seasonPassDefinition =
      self.destinyDataDefinition.DestinySeasonPassDefinition[
        currentSeason.seasonPassHash
      ];

    let trackableDataItems = [];

    let milestoneData = self.goalApi.getMilestoneData(namedObject);
    for (let milestone of milestoneData) {
      trackableDataItems.push(milestone);
    }

    trackableDataItems = trackableDataItems.sort((a, b) => {
      if (
        typeof a.nextLevelAt !== "undefined" &&
        typeof b.nextLevelAt !== "undefined"
      ) {
        let aProgress = (a.progressToNextLevel / a.nextLevelAt) * 100;
        let bProgress = (b.progressToNextLevel / b.nextLevelAt) * 100;

        return aProgress < bProgress ? 1 : -1;
      }

      if (typeof a.endDate !== "undefined") {
        return typeof b.endDate === "undefined" || a.endDate < b.endDate
          ? -1
          : 1;
      }

      return a.order < b.order ? 1 : -1;
    });

    trackableDataItems.unshift(
      self.goalApi.getSeasonRankData(
        namedObject,
        seasonDefinition,
        seasonPassDefinition
      )
    );

    self.trackedGoals = trackableDataItems;
    eventEmitter.emit("goal-list-update", trackableDataItems);

    return trackableDataItems;
  };

  var self = this;

  loadDataFromStorage();

  this.goalApi = new Destiny2Goals();

  return this;
}
