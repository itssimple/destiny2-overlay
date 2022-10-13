declare var db: Destiny2Database;
declare var eventEmitter: EventEmitter;

import { EventEmitter } from "../eventEmitter";
import { Destiny2Database } from "../indexedDB";
import { log } from "../log";
import { Destiny2Goals, GoalDataItem } from "./goalItems";

export type DestinyNamedObject = {
  characterInfo: any;
  characterProgression: any;
  characterActivities: any;
  characterUninstancedItemComponents: any;
  characterInventory: any;
  characterEquipment: any;
  characterPlugSets: any;
  characterCollectibles: any;
  characterRecords: any;
  profileProgression: any;
  metrics: any;
  itemComponents: any;
  records: any;
  profileInventory: any;
  profileCurrency: any;
  profilePlugSets: any;
  profileCollectibles: any;
  profile: any;
};
export class DestinyApiClient {
  destinyDataDefinition: {};
  randomState: string | null;
  goalApi: Destiny2Goals;
  isAuthenticated: () => Promise<boolean>;
  getAuthenticationUrl: () => string;
  lastVersion: string | null;
  profile: any;
  linkedProfiles: any;
  trackedGoals: GoalDataItem[];
  cachedManifest: any;
  checkManifestVersion: () => Promise<unknown>;
  checkStoredDefinitions: (downloadMissingDefinitions?: boolean) => Promise<string[]>;
  loadDestinyContentData: () => Promise<void>;
  loadCommonSettings: () => Promise<unknown>;
  getToken: (state: any, code: any) => Promise<unknown>;
  refreshToken: () => Promise<unknown>;
  getLinkedProfiles: () => Promise<unknown>;
  getUserProfile: (membershipId: string, membershipType: any) => Promise<unknown>;
  getLastPlayedCharacter: (forceRefresh?: boolean) => Promise<{
    characterInfo: any;
    characterProgression: any;
    characterActivities: any;
    characterUninstancedItemComponents: any;
    characterInventory: any;
    characterEquipment: any;
    characterPlugSets: any;
    characterCollectibles: any;
    characterRecords: any;
    profileProgression: any;
    metrics: any;
    itemComponents: any;
    records: any;
    profileInventory: any;
    profileCurrency: any;
    profilePlugSets: any;
    profileCollectibles: any;
    profile: any;
  }>;
  equipItems: (_lastPlayer: any) => Promise<unknown>;
  lockItem: (membershipType: any, characterId: any, itemId: any, lockState: any) => Promise<unknown>;
  getNamedDataObject: (forceRefresh?: boolean) => Promise<DestinyNamedObject>;
  getPresentationNodeFromHash: (hash: any) => any[];
  mapHashesToDefinitionsInObject: (object: any) => any;
  getTrackableData: (forceRefresh?: boolean) => Promise<any[]>;
  getManifest: () => Promise<{ Response: any } | null>;
  loadDataFromStorage: () => Promise<void>;
  loadCharacterHistory: (membershipId: string, characterId: string) => Promise<void>;

  constructor(d2ApiClient: any) {
    log("D2API", "Initializing Destiny Api Client");
    const apiToken = "c32cd3cb4eb94a84acc468a1cf333dac";

    const pluginClient = d2ApiClient;

    /**
     * @description Used for the base URL of content, like images and such.
     */
    const destinyBaseUrl = "https://www.bungie.net";

    const authGatewayUrl = "https://o2g.itssimple.se";

    const maxActivitiesPerFetch = 250;

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
      "DestinyDamageTypeDefinition",
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

    const DestinyItemState = {
      None: 0,
      Locked: 1,
      Tracked: 2,
      Masterwork: 4,
    };

    this.lastVersion = null;
    this.cachedManifest = null;

    this.destinyDataDefinition = {};

    this.randomState = null;

    this.profile = null;
    this.linkedProfiles = null;

    this.trackedGoals = [];

    async function callUrl(
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
      url: string,
      body: any | null = null,
      extraHeaders: any | null = null
    ) {
      let headers = {
        "X-User-Agent": "Destiny 2 Goal Tracker AppId/41664 (+d2goaltracker@itssimple.se)",
        "X-API-Key": apiToken,
      };

      if (extraHeaders !== null) {
        headers = {
          ...headers,
          ...extraHeaders,
        };
      }

      return await fetch(url, {
        method: method,
        headers: headers,
        body: body,
      });
    }

    this.checkManifestVersion = async function () {
      log("D2API", "Checking manifest version");
      return new Promise(async function (resolve, reject) {
        let manifest = await self.getManifest();

        if (manifest == null) {
          log("D2API", "Failed to fetch API");
          return null;
        }

        let lastVersion = (await db.getItem("manifestVersion")) ?? "null";
        if (manifest.Response.version !== lastVersion) {
          /* Currently cached data is older than 60 minutes, so we clear it. */
          await db.removeItem("lastManifestUpdate");
          await db.removeItem("manifest");
          await db.removeItem("manifestVersion");

          for (let dataType of destinyDataTypes) {
            await db.removeItem(`destinyContent-${dataType}`);
          }

          self.cachedManifest = manifest.Response;

          await db.setItem("manifestVersion", manifest.Response.version);
          await db.setItem("manifest", JSON.stringify(self.cachedManifest));
          await db.setItem("lastManifestUpdate", Date.now());

          resolve({ updatedManifest: true, version: self.lastVersion });
          log("D2API", "Manifest updated");
          return;
        }

        self.cachedManifest = manifest.Response;

        resolve({ updatedManifest: false, version: self.lastVersion });
        log("D2API", "Manifest version is up to date");
      });
    };

    this.getManifest = async function (): Promise<{
      Response: any;
    } | null> {
      let lastManifestUpdate = await db.getItem("lastManifestUpdate");
      log("D2API", "Checking if manifest is cached");

      if (lastManifestUpdate !== null && Date.now() - lastManifestUpdate < 60000 * 60) {
        if ((await db.getItem("manifest")) !== null) {
          log("D2API", "Manifest is cached");
          return { Response: JSON.parse(await db.getItem("manifest")) };
        }
      }

      let manifestRequest = await pluginClient.GET(`${destinyApiUrl}/Destiny2/Manifest/`);

      if (manifestRequest.Result.statusCode === 200) {
        let manifest = JSON.parse(manifestRequest.Result.content);
        if (manifest.ErrorStatus == "Success") {
          db.setItem("lastManifestUpdate", Date.now());
          db.setItem("manifest", JSON.stringify(manifest.Response));
          log("D2API", "Manifest updated");

          return { Response: manifest.Response };
        } else {
          log("D2API", "Manifesterror");
          log("D2API", manifest.Response);

          return null;
        }
      } else {
        let responseText = manifestRequest.Result.content;
        log("D2API", "Error when fetching Manifest");
        log("D2API", responseText);

        return null;
      }
    };

    this.loadDataFromStorage = async function () {
      log("D2API", "Loading data from storage");
      let _cachedManifest = await db.getItem("manifest");
      if (_cachedManifest !== null) {
        self.cachedManifest = JSON.parse(_cachedManifest);
      }

      if ((await db.getItem("manifestVersion")) !== null) {
        self.lastVersion = await db.getItem("manifestVersion");
      }

      await self.checkStoredDefinitions();

      for (let dataType of destinyDataTypes) {
        let data = await db.getItem(`destinyContent-${dataType}`);
        if (data !== null) {
          self.destinyDataDefinition[dataType] = JSON.parse(data);
        }
      }

      if ((await db.getItem("destiny-profile")) !== null) {
        self.profile = JSON.parse(await db.getItem("destiny-profile"));
      }

      if ((await db.getItem("destiny-linkedProfiles")) !== null) {
        self.linkedProfiles = JSON.parse(await db.getItem("destiny-linkedProfiles"));
      }

      log("D2API", "Data loaded from storage");
      eventEmitter.emit("destiny-data-loaded");
    };

    this.checkStoredDefinitions = async function (downloadMissingDefinitions = true) {
      let missingDefinitions: string[] = [];

      for (let dataType of destinyDataTypes) {
        if ((await db.getItem(`destinyContent-${dataType}`)) === null) {
          missingDefinitions.push(dataType);
        }
      }

      if (missingDefinitions.length > 0 && downloadMissingDefinitions) {
        for (let dataType of destinyDataTypes) {
          await db.removeItem(`destinyContent-${dataType}`);
        }

        await self.loadDestinyContentData();
      }

      return missingDefinitions;
    };

    this.loadDestinyContentData = async function () {
      for (let dataType of destinyDataTypes) {
        await loadDestinyContentDataType(dataType);
      }
    };

    this.loadCommonSettings = async function () {
      await refreshTokenIfExpired();

      return new Promise(async (resolve, reject) => {
        await pluginClient.GET(`${destinyApiUrl}/Settings`, await getUserToken(), (response) => {
          resolve(JSON.parse(response.content));
        });
      });
    };

    /**
     * @description Loads the manifest and then loads the content data.
     */
    async function loadDestinyContentDataType(dataType) {
      let manifest = self.cachedManifest;

      eventEmitter.emit("loading-text", `Loading ${dataType.replace("Destiny", "")}`);

      const contentTypeDownload = await pluginClient.GET(
        `${destinyBaseUrl}${manifest.jsonWorldComponentContentPaths.en[dataType]}`
      );

      if (contentTypeDownload.Result.statusCode !== 200) {
        log("Manifest download error", contentTypeDownload.Result.content);
        return;
      }

      const contentTypeJson = JSON.parse(contentTypeDownload.Result.content);

      self.destinyDataDefinition[dataType] = contentTypeJson;
      db.setItem(`destinyContent-${dataType}`, JSON.stringify(contentTypeJson));
    }

    /**
     * Returns the authentication URL needed to authenticate with Bungie.net.
     * @returns {string} Authentication URL that the user needs to visit to authenticated with Bungie.net.
     */
    this.getAuthenticationUrl = function () {
      this.randomState = (Math.random() * 10000).toString(32);
      return `${authGatewayUrl}/authenticate/destiny2?state=${this.randomState}`;
    };

    function handleTokenResponse(tokenResponse) {
      if (typeof tokenResponse.error == "undefined") {
        // This means we have our token, lets save it!
        db.setItem("destinyToken", tokenResponse.access_token);
        db.setItem("destinyRefreshToken", tokenResponse.refresh_token);
        db.setItem("destinyExpires", Date.now() + tokenResponse.expires_in * 1000);
        db.setItem("destinyRefreshTokenExpires", Date.now() + tokenResponse.refresh_expires_in * 1000);
        db.setItem("destinyBungieMembershipId", tokenResponse.membership_id);
      }
    }

    this.getToken = async function (state, code) {
      if (state != this.randomState) {
        // We're getting a bad state, so we'll just return null here.
        return null;
      }

      let tokenRequest = await pluginClient.POSTJson(
        `${authGatewayUrl}/token/destiny2`,
        JSON.stringify({ code: code })
      );

      if (tokenRequest.Result.statusCode === 200) {
        let tokenResponse = JSON.parse(tokenRequest.Result.content);

        handleTokenResponse(tokenResponse);
        return tokenResponse;
      } else {
        log("D2-Token", tokenRequest.text());
      }
    };

    this.refreshToken = async function () {
      const refreshToken = await db.getItem("destinyRefreshToken");
      if (refreshToken === null) {
        eventEmitter.emit("destiny2-auth-refresh-failed");
        return null;
      }

      let tokenRequest = await pluginClient.POSTJson(
        `${authGatewayUrl}/refresh/destiny2`,
        JSON.stringify({
          refresh_token: refreshToken,
        })
      );

      if (tokenRequest.Result.statusCode === 200) {
        let tokenResponse = JSON.parse(tokenRequest.Result.content);

        handleTokenResponse(tokenResponse);
        eventEmitter.emit("destiny2-auth-refreshed");
        return;
      } else {
        eventEmitter.emit("destiny2-auth-refresh-failed");
      }
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

    this.getLinkedProfiles = async function () {
      await refreshTokenIfExpired();

      return new Promise(async (resolve, reject) => {
        var bnetMemberId = await db.getItem("destinyBungieMembershipId");

        await pluginClient.GET(
          `${destinyApiUrl}/Destiny2/-1/Profile/${bnetMemberId}/LinkedProfiles/`,
          await getUserToken(),
          (result) => {
            if (result.statusCode === 200) {
              let profiles = JSON.parse(result.content);

              db.setItem("destiny-linkedProfiles", JSON.stringify(profiles.Response));

              self.linkedProfiles = profiles.Response;

              resolve(profiles.Response);
            } else {
              self.refreshToken();
              reject(result);
            }
          }
        );
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

    this.getUserProfile = async function (membershipId: string, membershipType) {
      let interestingComponents = [
        profileComponents.Profiles,
        profileComponents.ProfileInventories,
        profileComponents.ProfileCurrencies,
        profileComponents.ProfileProgression,
        profileComponents.Characters,
        profileComponents.CharacterInventories,
        profileComponents.CharacterProgressions,
        profileComponents.CharacterActivities,
        profileComponents.CharacterEquipment,
        profileComponents.ItemInstances,
        profileComponents.ItemObjectives,
        profileComponents.ItemSockets,
        profileComponents.ItemTalentGrids,
        profileComponents.ItemCommonData,
        profileComponents.ItemPlugStates,
        profileComponents.ItemPlugObjectives,
        profileComponents.ItemReusablePlugs,
        profileComponents.Metrics,
        profileComponents.Records,
        profileComponents.Collectibles,
        profileComponents.StringVariables,
      ];

      await refreshTokenIfExpired();

      return new Promise(async (resolve, reject) => {
        await pluginClient.GET(
          `${destinyApiUrl}/Destiny2/${membershipType}/Profile/${membershipId}/?components=${interestingComponents.join(
            ","
          )}`,
          await getUserToken(),
          (result) => {
            if (result.statusCode === 200) {
              let profile = JSON.parse(result.content);

              db.setItem("destiny-profile", JSON.stringify(profile.Response));
              self.profile = profile.Response;

              resolve(profile.Response);
            } else {
              self.refreshToken();
              reject(result);
            }
          }
        );
      });
    };

    this.getLastPlayedCharacter = async function (forceRefresh = false) {
      await refreshTokenIfExpired();

      let _profile = self.profile;

      if (forceRefresh) {
        _profile = null;
      }

      if (self.linkedProfiles === null) {
        return null;
      }

      await self.getLinkedProfiles();

      if (
        self.linkedProfiles !== null &&
        self.linkedProfiles.profiles !== null &&
        self.linkedProfiles.profiles.length > 0
      ) {
        var primaryMembership = self.linkedProfiles.profiles.sort((a, b) =>
          a.dateLastPlayed > b.dateLastPlayed ? -1 : 1
        )[0];

        _profile = await self.getUserProfile(primaryMembership.membershipId, primaryMembership.membershipType);
      }

      let characters = [];

      for (let char of _profile.profile.data.characterIds) {
        characters.push(_profile.characters.data[char]);
      }

      let _last = characters.sort((a, b) => (a.dateLastPlayed > b.dateLastPlayed ? -1 : 1))[0];

      let lastPlayedCharacter = {
        characterInfo: _last,
        characterProgression: !!!_profile.characterProgressions.disabled
          ? _profile.characterProgressions.data[_last.characterId]
          : {},
        characterActivities: !!!_profile.characterActivities.disabled
          ? _profile.characterActivities.data[_last.characterId]
          : {},
        characterUninstancedItemComponents:
          _profile.characterUninstancedItemComponents[_last.characterId].objectives.data,
        characterInventory: _profile.characterInventories.data[_last.characterId].items,
        characterEquipment: _profile.characterEquipment.data[_last.characterId].items,
        characterPlugSets: !!!_profile.characterPlugSets.disabled
          ? _profile.characterPlugSets.data[_last.characterId].plugs
          : {},
        characterCollectibles: _profile.characterCollectibles.data[_last.characterId].collectibles,
        characterRecords: _profile.characterRecords.data[_last.characterId],
        characterStringVariables: _profile.characterStringVariables.data[_last.characterId],
        profileProgression: _profile.profileProgression.data,
        metrics: _profile.metrics.data.metrics,
        itemComponents: _profile.itemComponents,
        records: _profile.profileRecords.data,
        profileInventory: _profile.profileInventory.data.items,
        profileCurrency: _profile.profileCurrencies.data.items,
        profilePlugSets: !!!_profile.profilePlugSets.disabled ? _profile.profilePlugSets.data.plugs : {},
        profileCollectibles: _profile.profileCollectibles.data,
        profile: _profile.profile.data,
        profileStringVariables: _profile.profileStringVariables.data,
      };

      return lastPlayedCharacter;
    };

    this.equipItems = async function (_lastPlayer) {
      await refreshTokenIfExpired();

      return new Promise(async (resolve, reject) => {
        await pluginClient.POSTJson(
          `${destinyApiUrl}/Destiny2/Actions/Items/EquipItems/`,
          JSON.stringify({
            characterId: _lastPlayer.characterInfo.characterId,
            itemIds: [],
            membershipType: 3,
          }),
          await getUserToken(),
          (result) => {
            if (result.statusCode === 200) {
              resolve(result.content);
            } else {
              self.refreshToken();
              reject(result);
            }
          }
        );
      });
    };

    this.lockItem = async function (membershipType, characterId, itemId, lockState) {
      await refreshTokenIfExpired();

      return new Promise(async (resolve, reject) => {
        await pluginClient.POSTJson(
          `${destinyApiUrl}/Destiny2/Actions/Items/SetLockState/`,
          JSON.stringify({
            membershipType: membershipType,
            characterId: characterId,
            itemId: itemId,
            state: lockState,
          }),
          await getUserToken(),
          (result) => {
            if (result.statusCode === 200) {
              resolve(result.content);
            } else {
              self.refreshToken();
              reject(result);
            }
          }
        );
      });
    };

    this.getNamedDataObject = async function (forceRefresh = false): Promise<DestinyNamedObject> {
      let _lastPlayer = await self.getLastPlayedCharacter(forceRefresh);

      if (_lastPlayer == null) {
        return null;
      }

      let namedDataObject = {
        ..._lastPlayer,
      };

      for (let statKey of Object.keys(namedDataObject.characterInfo.stats)) {
        namedDataObject.characterInfo.stats[statKey] = {
          statValue: namedDataObject.characterInfo.stats[statKey],
          statHash: statKey,
        };
      }

      for (let metricKey of Object.keys(namedDataObject.metrics)) {
        namedDataObject.metrics[metricKey] = {
          ...namedDataObject.metrics[metricKey],
          metricHash: metricKey,
        };
      }

      for (let recordKey of Object.keys(namedDataObject.records.records)) {
        namedDataObject.records.records[recordKey] = {
          ...namedDataObject.records.records[recordKey],
          recordHash: recordKey,
          parentNodeHashes: self.destinyDataDefinition.DestinyRecordDefinition[recordKey].parentNodeHashes,
        };
      }

      for (let recordKey of Object.keys(namedDataObject.characterRecords.records)) {
        namedDataObject.characterRecords.records[recordKey] = {
          ...namedDataObject.characterRecords.records[recordKey],
          recordHash: recordKey,
          parentNodeHashes: self.destinyDataDefinition.DestinyRecordDefinition[recordKey].parentNodeHashes,
        };
      }

      namedDataObject = self.mapHashesToDefinitionsInObject(namedDataObject);

      const cacheBreaker = await db.getItem("destiny2-use-cachebreaker", false);
      if (cacheBreaker) {
        const lockableItems = _lastPlayer.characterInventory.filter((i) => i.lockable && i.inventoryitemItemType == 3);

        if (lockableItems.length > 0) {
          await self.lockItem(
            _lastPlayer.characterInfo.membershipType,
            _lastPlayer.characterInfo.characterId,
            lockableItems[0].itemInstanceId,
            lockableItems[0].state & DestinyItemState.Locked
          );
        }
      }

      eventEmitter.emit("destiny2-api-update", namedDataObject);

      return namedDataObject;
    };

    this.getPresentationNodeFromHash = function (hash) {
      const presentationNameArray = [];

      const presentationNode = self.destinyDataDefinition.DestinyPresentationNodeDefinition[hash];
      if (presentationNode) {
        presentationNameArray.unshift({
          name: presentationNode.displayProperties.name,
          description: presentationNode.displayProperties.description,
          icon: presentationNode.displayProperties.icon,
          hash: hash,
        });

        if (presentationNode.parentNodeHashes) {
          for (let _hash of presentationNode.parentNodeHashes) {
            const subItems = self.getPresentationNodeFromHash(_hash);
            for (let item of subItems) {
              presentationNameArray.push(item);
            }
          }
        }
      }

      return presentationNameArray;
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
          _objectCopy[key] = _field;
        } else if (_type === "object" && _field !== null) {
          _objectCopy[key] = self.mapHashesToDefinitionsInObject(_objectCopy[key]);
        } else {
          if (key.indexOf("Hash") > -1 && !Array.isArray(_field)) {
            let _hashType = key.split("Hash")[0].replace("current", "").toLowerCase();

            switch (_hashType) {
              case "item":
              case "plugitem":
                _hashType = "inventoryitem";
                break;
            }

            let dataType = destinyDataTypes.find(
              (i) => i.toLowerCase() == `Destiny${_hashType}Definition`.toLowerCase()
            );
            let definitionData = self.destinyDataDefinition[dataType];
            if (definitionData && definitionData[_field] && definitionData[_field].displayProperties) {
              const dField = definitionData[_field];
              if (dField.displayProperties.name && dField.displayProperties.name.length > 0) {
                _objectCopy[`${_hashType}Name`] = dField.displayProperties.name;
              } else if (dField.setData && dField.setData.questLineName && dField.setData.questLineName.length > 0) {
                _objectCopy[`${_hashType}Name`] = dField.setData.questLineName;
              }

              if (dField.displayProperties.description && dField.displayProperties.description.length > 0) {
                _objectCopy[`${_hashType}Description`] = dField.displayProperties.description;
              }

              if (dField.displayProperties.icon && dField.displayProperties.icon.length > 0) {
                _objectCopy[`${_hashType}Icon`] = dField.displayProperties.icon;
              }

              if (dField.progressDescription && dField.progressDescription.length > 0) {
                _objectCopy[`${_hashType}ProgressDescription`] = dField.progressDescription;
              }

              if (typeof dField.inProgressValueStyle !== "undefined") {
                _objectCopy[`${_hashType}InProgressValueStyle`] = dField.inProgressValueStyle;
              }

              if (typeof dField.completedValueStyle !== "undefined") {
                _objectCopy[`${_hashType}CompletedValueStyle`] = dField.completedValueStyle;
              }

              if (typeof dField.itemType !== "undefined") {
                _objectCopy[`${_hashType}ItemType`] = dField.itemType;
              }

              if (typeof dField.parentNodeHashes !== "undefined") {
                _objectCopy[`parentNodeHashes`] = dField.parentNodeHashes.map((item) => {
                  return self.getPresentationNodeFromHash(item);
                });
              }
            }
          }

          _objectCopy[key] = _field;
        }
      }

      return _objectCopy;
    };

    this.getTrackableData = async function (forceRefresh = false): Promise<GoalDataItem[]> {
      let namedObject = await self.getNamedDataObject(forceRefresh);

      if (namedObject == null) {
        return null;
      }

      let seasonDefinition = self.destinyDataDefinition.DestinySeasonDefinition[namedObject.profile.currentSeasonHash];
      let seasonPassDefinition =
        self.destinyDataDefinition.DestinySeasonPassDefinition[seasonDefinition.seasonPassHash];

      let trackableDataItems: GoalDataItem[] = [];

      let milestoneData = self.goalApi.getMilestoneData(namedObject);
      for (let milestone of milestoneData) {
        trackableDataItems.push(milestone);
      }

      let bountyData = self.goalApi.getBounties(namedObject);
      for (let bounty of bountyData) {
        trackableDataItems.push(bounty);
      }

      let questData = self.goalApi.getQuests(namedObject);
      for (let quest of questData) {
        trackableDataItems.push(quest);
      }

      let characterRecords = self.goalApi.getCharacterRecords(namedObject);

      for (let characterRecord of characterRecords) {
        trackableDataItems.push(characterRecord);
      }

      function sortTrackableItems(a, b) {
        if (typeof a.nextLevelAt !== "undefined" && typeof b.nextLevelAt !== "undefined") {
          let aProgress = (a.progressToNextLevel / a.nextLevelAt) * 100;
          let bProgress = (b.progressToNextLevel / b.nextLevelAt) * 100;

          return aProgress < bProgress ? 1 : -1;
        }

        if (typeof a.endDate !== "undefined") {
          return typeof b.endDate === "undefined" || a.endDate < b.endDate ? -1 : 1;
        }

        return a.order < b.order ? 1 : -1;
      }

      const trackedItems = trackableDataItems.filter((i) => i.tracked).sort(sortTrackableItems);

      const itemsWithExpiration = trackableDataItems.filter((i) => i.endDate && !i.tracked).sort(sortTrackableItems);
      const itemsWithoutExpiration = trackableDataItems
        .filter((i) => !i.endDate && !i.tracked)
        .sort(sortTrackableItems);

      trackableDataItems = [...trackedItems, ...itemsWithExpiration, ...itemsWithoutExpiration];

      trackableDataItems.unshift(self.goalApi.getSeasonRankData(namedObject, seasonDefinition, seasonPassDefinition));

      self.trackedGoals = trackableDataItems;
      eventEmitter.emit("goal-list-update", trackableDataItems);

      return trackableDataItems;
    };

    this.isAuthenticated = async function () {
      try {
        await refreshTokenIfExpired();
        const isAuthenticated = (await db.getItem("destinyToken")) !== null;
        eventEmitter.emit("destiny2-is-authenticated", isAuthenticated);
        return isAuthenticated;
      } catch (e) {
        log("AUTH-FAIL", e);
        eventEmitter.emit("destiny2-is-authenticated", false);
        return false;
      }
    };

    this.loadCharacterHistory = async function (membershipId, characterId) {
      await refreshTokenIfExpired();

      log("CHARACTER-HISTORY", "Loading character history");
      eventEmitter.emit("character-history-loading", {
        membershipId,
        characterId,
      });

      return new Promise<void>(async (resolve, reject) => {
        let savedAmount = maxActivitiesPerFetch;
        let localCharacterHistory = await db.getStorageItems(
          "playerActivity",
          (item) => item.value.characterId == characterId
        );
        let page = Math.floor(localCharacterHistory.length / 250);
        log(
          "CHARACTER-HISTORY",
          `Loaded local character history, found ${localCharacterHistory.length} items, skipping to page ${page}`
        );

        while (savedAmount > 0) {
          await refreshTokenIfExpired();
          let historyActivityUrl = `https://www.bungie.net/Platform/Destiny2/-1/Account/${membershipId}/Character/${characterId}/Stats/Activities?count=${maxActivitiesPerFetch}&page=${page}`;
          savedAmount = 0;
          log("CHARACTER-HISTORY", `Loading page ${page} (${historyActivityUrl})`);
          var history = await pluginClient.GET(historyActivityUrl, await getUserToken());
          try {
            let data = JSON.parse(history.Result.content);
            if (data.Response.activities) {
              log("CHARACTER-HISTORY", `Got ${data.Response.activities.length} activities`);
              for (let activity of data.Response.activities) {
                if ((await db.getStorageItem("playerActivity", activity.activityDetails.instanceId)) === null) {
                  await db.setStorageItem("playerActivity", activity.activityDetails.instanceId, {
                    characterId: characterId,
                    activity: activity,
                  });
                }
                savedAmount++;
              }
              eventEmitter.emit("character-history-partial-loaded", {
                membershipId,
                characterId,
              });
              log("CHARACTER-HISTORY", `Saved ${savedAmount} activities`);
            }
          } catch (e) {
            log("CHARACTER-HISTORY", "Failed to load character history", e, history);
            self.refreshToken();
            reject(history);
          }

          page++;
        }

        eventEmitter.emit("character-history-loaded", {
          membershipId,
          characterId,
        });

        resolve();
      });
    };

    var self = this;

    this.goalApi = new Destiny2Goals();

    log("D2API", "Destiny Api Client initialized");

    return this;
  }
}
