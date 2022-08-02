import { DestinyApiClient } from "./apiClient";

declare var destinyApiClient: DestinyApiClient;

export type GoalType = "seasonrank" | "milestone" | "bounty" | "quest" | "characterRecord";

export type GoalDataItem = {
  name: string;
  description: string;
  icon: string;
  nextLevelAt?: number;
  progressToNextLevel?: number;
  type: GoalType;
  order: number;
  inProgressValueStyle: number;
  completedValueStyle: number;
  tracked?: boolean | undefined | null;
  startDate?: string | undefined | null;
  endDate?: string | undefined | null;
};

export type SeasonRankData = GoalDataItem & {};

export type MilestoneDataItem = GoalDataItem & {};

export type BountyDataItem = GoalDataItem & {
  state?: ItemState;
};

export type QuestDataItem = GoalDataItem & {
  state?: ItemState;
};

export type CharacterRecordDataItem = GoalDataItem & {
  state?: RecordState;
};

export enum ItemState {
  None = 0,
  Locked = 1,
  Tracked = 2,
  Masterwork = 4,
  Crafted = 8,
  HighlightedObjective = 16,
}

export enum RecordState {
  None = 0,
  RecordRedeemed = 1,
  RewardUnavailable = 2,
  ObjectiveNotCompleted = 4,
  Obscured = 8,
  Invisible = 16,
  EntitlementUnowned = 32,
  CanEquipTitle = 64,
}

export class Destiny2Goals {
  getSeasonRankData: (namedObject: any, seasonDefinition: any, seasonPassDefinition: any) => SeasonRankData;
  replaceStringVariables: (string: string, profileVariables: string[]) => string;
  getMilestoneData: (namedObject: any) => MilestoneDataItem[];
  getBounties: (namedObject: any) => BountyDataItem[];
  getQuests: (namedObject: any) => QuestDataItem[];
  getCharacterRecords: (namedObject: any) => CharacterRecordDataItem[];

  constructor() {
    /**
     * @description Used for the base URL of content, like images and such.
     */
    const destinyBaseUrl = "https://www.bungie.net";

    this.getSeasonRankData = function (namedObject, seasonDefinition, seasonPassDefinition): SeasonRankData {
      let seasonPassData = namedObject.characterProgression.progressions[seasonDefinition.seasonPassProgressionHash];
      let seasonPassProgressionData =
        namedObject.characterProgression.progressions[seasonPassDefinition.prestigeProgressionHash];

      let seasonArtifactData =
        destinyApiClient.destinyDataDefinition.DestinyInventoryItemDefinition[seasonDefinition.artifactItemHash];

      let seasonRank = seasonPassData.level;
      let nextLevelAt = seasonPassData.nextLevelAt;
      let progressToNextLevel = seasonPassData.progressToNextLevel;

      if (seasonPassData.level == seasonPassData.levelCap) {
        seasonRank += seasonPassProgressionData.level;
        nextLevelAt += seasonPassProgressionData.nextLevelAt;
        progressToNextLevel += seasonPassProgressionData.progressToNextLevel;
      }

      let seasonRankDataItem: SeasonRankData = {
        name: `Season Rank ${seasonRank}`,
        description: seasonDefinition.displayProperties.name,
        icon: `${seasonArtifactData.displayProperties.icon}`,
        startDate: seasonDefinition.startDate,
        endDate: seasonDefinition.endDate,
        nextLevelAt: nextLevelAt,
        progressToNextLevel: progressToNextLevel,
        type: "seasonrank",
        order: -1,
        inProgressValueStyle: 0,
        completedValueStyle: 0,
      };
      return seasonRankDataItem;
    };

    this.replaceStringVariables = function (string, profileVariables): string {
      if (!string || string.indexOf("{var:") === -1) return string;
      var matchRegex = /{var:(\d+)}/g;

      var allMatches = string.match(matchRegex);

      let newString = string;

      if (allMatches) {
        for (var i = 0; i < allMatches.length; i++) {
          var match = allMatches[i];
          var _match = match.match(/\d+/);
          if (_match) {
            var matchIndex = _match[0];
            var matchString = profileVariables[matchIndex];

            if (matchString) {
              newString = newString.replace(match, matchString);
            }
          }
        }
      }

      return newString;
    };

    this.getMilestoneData = function (namedObject): MilestoneDataItem[] {
      let milestoneData: MilestoneDataItem[] = [];

      let milestoneKeys = Object.keys(namedObject.characterProgression.milestones);

      for (let milestoneKey of milestoneKeys) {
        let milestone = namedObject.characterProgression.milestones[milestoneKey];

        let milestoneDataItem: MilestoneDataItem = {
          name: this.replaceStringVariables(
            milestone.milestoneName,
            namedObject.profileStringVariables.integerValuesByHash
          ),
          description: this.replaceStringVariables(
            milestone.milestoneDescription,
            namedObject.profileStringVariables.integerValuesByHash
          ),
          order: milestone.order,
          icon: milestone.milestoneIcon,
          type: "milestone",
          inProgressValueStyle: 0,
          completedValueStyle: 0,
        };

        if (milestone.startDate) {
          milestoneDataItem.startDate = milestone.startDate;
        }

        if (milestone.endDate) {
          milestoneDataItem.endDate = milestone.endDate;
        }

        if (milestone.availableQuests && milestone.availableQuests.length > 0) {
          for (let quest of milestone.availableQuests) {
            if (quest.tracked) {
              milestoneDataItem.tracked = true;
            }
            if (quest.status.started && !quest.status.completed) {
              if (quest.status.stepObjectives && quest.status.stepObjectives.length > 0) {
                for (let step of quest.status.stepObjectives) {
                  if (!step.complete) {
                    if (typeof step.progress !== "undefined") {
                      milestoneDataItem.progressToNextLevel = step.progress;
                    }

                    if (typeof step.completionValue !== "undefined") {
                      milestoneDataItem.nextLevelAt = step.completionValue;
                    }

                    if (typeof step.objectiveInProgressValueStyle !== "undefined") {
                      milestoneDataItem.inProgressValueStyle = step.objectiveInProgressValueStyle;
                    }

                    if (typeof step.objectiveCompletedValueStyle !== "undefined") {
                      milestoneDataItem.completedValueStyle = step.objectiveCompletedValueStyle;
                    }

                    if ((milestoneDataItem.icon ?? "").length == 0 && typeof step.activityIcon !== "undefined") {
                      milestoneDataItem.icon = step.activityIcon;
                    }

                    break;
                  }
                }
              }
            }
          }
        }

        if (milestone.activities && milestone.activities.length > 0) {
          for (let activity of milestone.activities) {
            if (activity.challenges && activity.challenges.length > 0) {
              for (let challenge of activity.challenges) {
                if (!challenge.objective.complete) {
                  if (typeof challenge.objective.progress !== "undefined") {
                    milestoneDataItem.progressToNextLevel = challenge.objective.progress;
                  }

                  if (typeof challenge.objectiveInProgressValueStyle !== "undefined") {
                    milestoneDataItem.inProgressValueStyle = challenge.objectiveInProgressValueStyle;
                  }

                  if (typeof challenge.objectiveCompletedValueStyle !== "undefined") {
                    milestoneDataItem.completedValueStyle = challenge.objectiveCompletedValueStyle;
                  }

                  if (typeof challenge.objective.completionValue !== "undefined") {
                    milestoneDataItem.nextLevelAt = challenge.objective.completionValue;
                  }

                  break;
                }
              }
            }
            break;
          }
        }

        milestoneData.push(milestoneDataItem);
      }

      return milestoneData;
    };

    const bountyItemType = 26;

    this.getBounties = function (namedObject): BountyDataItem[] {
      let bountyData: BountyDataItem[] = [];

      var bountyItems = namedObject.characterInventory.filter((item) => item.inventoryitemItemType === bountyItemType);

      for (let bounty of bountyItems) {
        let itemObjectives = namedObject.itemComponents.objectives.data[bounty.itemInstanceId].objectives;

        let incompleteTasks = itemObjectives.filter((obj) => !obj.complete);

        // If we don't have any tasks left to do, we'll ignore this bounty
        if (incompleteTasks.length === 0) continue;

        for (let objective of incompleteTasks) {
          let bountyDataItem: BountyDataItem = {
            name: this.replaceStringVariables(
              bounty.inventoryitemName,
              namedObject.profileStringVariables.integerValuesByHash
            ),
            description: this.replaceStringVariables(
              bounty.inventoryitemDescription,
              namedObject.profileStringVariables.integerValuesByHash
            ),
            order: 500,
            icon: bounty.inventoryitemIcon,
            type: "bounty",
            inProgressValueStyle: 0,
            completedValueStyle: 0,
            tracked: (bounty.state & ItemState.Tracked) == ItemState.Tracked,
            state: bounty.state,
          };

          if (typeof bounty.expirationDate !== "undefined") {
            bountyDataItem.endDate = bounty.expirationDate;

            // If the bounty is expired, we'll ignore it
            if (new Date(bounty.expirationDate).getTime() < new Date().getTime()) {
              continue;
            }
          }

          if (typeof objective.completionValue !== "undefined") {
            bountyDataItem.nextLevelAt = objective.completionValue;

            if (typeof objective.objectiveInProgressValueStyle !== "undefined") {
              bountyDataItem.inProgressValueStyle = objective.objectiveInProgressValueStyle;
            }

            if (typeof objective.objectiveCompletedValueStyle !== "undefined") {
              bountyDataItem.completedValueStyle = objective.objectiveCompletedValueStyle;
            }

            if (typeof objective.progress !== "undefined") {
              bountyDataItem.progressToNextLevel = objective.progress;
            }

            if (typeof objective.objectiveProgressDescription !== "undefined") {
              // ${bountyDataItem.description}<br />
              bountyDataItem.description = this.replaceStringVariables(
                objective.objectiveProgressDescription,
                namedObject.profileStringVariables.integerValuesByHash
              );
            }

            bountyData.push(bountyDataItem);
          }
        }
      }

      return bountyData;
    };

    const questBucketHash = 1345459588;

    this.getQuests = function (namedObject): QuestDataItem[] {
      let questData: QuestDataItem[] = [];

      var questItems = namedObject.characterInventory.filter(
        (item) =>
          item.bucketHash === questBucketHash &&
          [bountyItemType].filter((i) => i != item.inventoryitemItemType).length > 0
      );

      let instancedQuestItems = questItems.filter((item) => typeof item.itemInstanceId !== "undefined");

      let uninstancedQuestItems = questItems.filter((item) => typeof item.itemInstanceId === "undefined");

      for (let instanceQuest of instancedQuestItems) {
        let itemObjectives = namedObject.itemComponents.objectives.data[instanceQuest.itemInstanceId];

        if (itemObjectives) {
          const _objectives = itemObjectives.objectives.filter((objective) => objective.visible && !objective.complete);

          for (let objective of _objectives) {
            let questDataItem: QuestDataItem = {
              name: this.replaceStringVariables(
                instanceQuest.inventoryitemName,
                namedObject.profileStringVariables.integerValuesByHash
              ),
              description: this.replaceStringVariables(
                instanceQuest.inventoryitemDescription,
                namedObject.profileStringVariables.integerValuesByHash
              ),
              order: 1000,
              icon: instanceQuest.inventoryitemIcon,
              type: "quest",
              inProgressValueStyle: 0,
              completedValueStyle: 0,
              tracked: (instanceQuest.state & ItemState.Tracked) == ItemState.Tracked,
              state: instanceQuest.state,
            };

            if (typeof objective.completionValue !== "undefined") {
              questDataItem.nextLevelAt = objective.completionValue;

              if (typeof objective.objectiveInProgressValueStyle !== "undefined") {
                questDataItem.inProgressValueStyle = objective.objectiveInProgressValueStyle;
              }

              if (typeof objective.objectiveCompletedValueStyle !== "undefined") {
                questDataItem.completedValueStyle = objective.objectiveCompletedValueStyle;
              }

              if (typeof objective.progress !== "undefined") {
                questDataItem.progressToNextLevel = objective.progress;
              }

              if (typeof objective.objectiveProgressDescription !== "undefined") {
                // ${questDataItem.description}<br />
                questDataItem.description = this.replaceStringVariables(
                  objective.objectiveProgressDescription,
                  namedObject.profileStringVariables.integerValuesByHash
                );
              }

              questData.push(questDataItem);
            }
          }
        }
      }

      for (let uninstancedQuest of uninstancedQuestItems) {
        let questObjectives = (
          namedObject.characterProgression.uninstancedItemObjectives[uninstancedQuest.itemHash] ?? []
        ).filter((objective) => objective.visible && !objective.complete);

        for (let objective of questObjectives) {
          let questDataItem: QuestDataItem = {
            name: this.replaceStringVariables(
              uninstancedQuest.inventoryitemName,
              namedObject.profileStringVariables.integerValuesByHash
            ),
            description: this.replaceStringVariables(
              uninstancedQuest.inventoryitemDescription,
              namedObject.profileStringVariables.integerValuesByHash
            ),
            order: 10000,
            icon: uninstancedQuest.inventoryitemIcon,
            type: "quest",
            inProgressValueStyle: 0,
            completedValueStyle: 0,
            tracked: (uninstancedQuest.state & ItemState.Tracked) == ItemState.Tracked,
            state: uninstancedQuest.state,
          };

          if (typeof objective.completionValue !== "undefined") {
            questDataItem.nextLevelAt = objective.completionValue;

            if (typeof objective.objectiveInProgressValueStyle !== "undefined") {
              questDataItem.inProgressValueStyle = objective.objectiveInProgressValueStyle;
            }

            if (typeof objective.objectiveCompletedValueStyle !== "undefined") {
              questDataItem.completedValueStyle = objective.objectiveCompletedValueStyle;
            }

            if (typeof objective.progress !== "undefined") {
              questDataItem.progressToNextLevel = objective.progress;
            }

            if (typeof objective.objectiveProgressDescription !== "undefined") {
              // ${questDataItem.description}<br />
              questDataItem.description = this.replaceStringVariables(
                objective.objectiveProgressDescription,
                namedObject.profileStringVariables.integerValuesByHash
              );
            }

            questData.push(questDataItem);
          }
        }
      }

      return questData;
    };

    this.getCharacterRecords = function (namedObject): CharacterRecordDataItem[] {
      let characterRecords: CharacterRecordDataItem[] = [];

      let characterRecordKeys = Object.keys(namedObject.characterRecords.records);
      for (let key of characterRecordKeys) {
        let characterRecord = namedObject.characterRecords.records[key];
        if (typeof characterRecord.objectives === "undefined" || (characterRecord.recordName ?? "").length === 0)
          continue;

        let recordObjectives = characterRecord.objectives.filter(
          (objective) => objective.visible && !objective.complete
        );

        for (let objective of recordObjectives) {
          let characterRecordData: CharacterRecordDataItem = {
            name: characterRecord.recordName,
            type: "characterRecord",
            order: 100,
            icon: characterRecord.recordIcon,
            // ${characterRecord.recordDescription}<br />
            description: `${objective.objectiveProgressDescription ?? ""}`,
            progressToNextLevel: objective.progress,
            nextLevelAt: objective.completionValue,
            inProgressValueStyle: objective.objectiveInProgressValueStyle,
            completedValueStyle: objective.objectiveCompletedValueStyle,
            state: characterRecord.state,
          };

          characterRecords.push(characterRecordData);
        }
      }

      return characterRecords;
    };

    return this;
  }
}
