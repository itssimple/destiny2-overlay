function Destiny2Goals() {
  /**
   * @description Used for the base URL of content, like images and such.
   */
  const destinyBaseUrl = "https://www.bungie.net";

  this.getSeasonRankData = function (
    namedObject,
    seasonDefinition,
    seasonPassDefinition
  ) {
    let seasonPassData =
      namedObject.characterProgression.progressions[
        seasonDefinition.seasonPassProgressionHash
      ];
    let seasonPassProgressionData =
      namedObject.characterProgression.progressions[
        seasonPassDefinition.prestigeProgressionHash
      ];

    let seasonArtifactData =
      destinyApiClient.destinyDataDefinition.DestinyInventoryItemDefinition[
        seasonDefinition.artifactItemHash
      ];

    let seasonRankDataItem = {
      name: `Season Rank ${
        seasonPassData.level + seasonPassProgressionData.level
      }`,
      description: seasonDefinition.displayProperties.name,
      icon: `${seasonArtifactData.displayProperties.icon}`,
      startDate: seasonDefinition.startDate,
      endDate: seasonDefinition.endDate,
      nextLevelAt:
        seasonPassData.nextLevelAt + seasonPassProgressionData.nextLevelAt,
      progressToNextLevel:
        seasonPassData.progressToNextLevel +
        seasonPassProgressionData.progressToNextLevel,
      type: "seasonrank",
      order: -1,
      inProgressValueStyle: 0,
      completedValueStyle: 0,
    };
    return seasonRankDataItem;
  };

  this.getMilestoneData = function (namedObject) {
    let milestoneData = [];

    let milestoneKeys = Object.keys(
      namedObject.characterProgression.milestones
    );

    for (let milestoneKey of milestoneKeys) {
      let milestone = namedObject.characterProgression.milestones[milestoneKey];

      let milestoneDataItem = {
        name: milestone.milestoneName,
        description: milestone.milestoneDescription,
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
          if (quest.status.started && !quest.status.completed) {
            if (
              quest.status.stepObjectives &&
              quest.status.stepObjectives.length > 0
            ) {
              for (let step of quest.status.stepObjectives) {
                if (!step.complete) {
                  if (typeof step.progress !== "undefined") {
                    milestoneDataItem.progressToNextLevel = step.progress;
                  }

                  if (typeof step.completionValue !== "undefined") {
                    milestoneDataItem.nextLevelAt = step.completionValue;
                  }

                  if (
                    typeof step.objectiveInProgressValueStyle !== "undefined"
                  ) {
                    milestoneDataItem.inProgressValueStyle =
                      step.objectiveInProgressValueStyle;
                  }

                  if (
                    typeof step.objectiveCompletedValueStyle !== "undefined"
                  ) {
                    milestoneDataItem.completedValueStyle =
                      step.objectiveCompletedValueStyle;
                  }

                  if (
                    (milestoneDataItem.icon ?? "").length == 0 &&
                    typeof step.activityIcon !== "undefined"
                  ) {
                    milestoneDataItem.icon = step.activityIcon;
                  }

                  break;
                }
              }
            }
            break;
          }
        }
      }

      if (milestone.activities && milestone.activities.length > 0) {
        for (let activity of milestone.activities) {
          if (activity.challenges && activity.challenges.length > 0) {
            for (let challenge of activity.challenges) {
              if (!challenge.objective.complete) {
                if (typeof challenge.objective.progress !== "undefined") {
                  milestoneDataItem.progressToNextLevel =
                    challenge.objective.progress;
                }

                if (
                  typeof challenge.objectiveInProgressValueStyle !== "undefined"
                ) {
                  milestoneDataItem.inProgressValueStyle =
                    step.objectiveInProgressValueStyle;
                }

                if (
                  typeof challenge.objectiveCompletedValueStyle !== "undefined"
                ) {
                  milestoneDataItem.completedValueStyle =
                    challenge.objectiveCompletedValueStyle;
                }

                if (
                  typeof challenge.objective.completionValue !== "undefined"
                ) {
                  milestoneDataItem.nextLevelAt =
                    challenge.objective.completionValue;
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

  this.getBounties = function (namedObject) {
    let bountyData = [];

    var bountyItems = namedObject.characterInventory.filter(
      (item) => item.inventoryitemItemType === bountyItemType
    );

    for (let bounty of bountyItems) {
      let itemObjectives =
        namedObject.itemComponents.objectives.data[bounty.itemInstanceId]
          .objectives;

      let incompleteTasks = itemObjectives.filter((obj) => !obj.complete);

      // If we don't have any tasks left to do, we'll ignore this bounty
      if (incompleteTasks.length === 0) continue;

      for (let objective of incompleteTasks) {
        let bountyDataItem = {
          name: bounty.inventoryitemName,
          description: bounty.inventoryitemDescription,
          order: 500,
          icon: bounty.inventoryitemIcon,
          type: "bounty",
          inProgressValueStyle: 0,
          completedValueStyle: 0,
        };

        if (typeof bounty.expirationDate !== "undefined") {
          bountyDataItem.endDate = bounty.expirationDate;

          // If the bounty is expired, we'll ignore it
          if (new Date(bounty.expirationDate) < Date.now()) {
            continue;
          }
        }

        if (typeof objective.completionValue !== "undefined") {
          bountyDataItem.nextLevelAt = objective.completionValue;

          if (typeof objective.objectiveInProgressValueStyle !== "undefined") {
            bountyDataItem.inProgressValueStyle =
              objective.objectiveInProgressValueStyle;
          }

          if (typeof objective.objectiveCompletedValueStyle !== "undefined") {
            bountyDataItem.completedValueStyle =
              objective.objectiveCompletedValueStyle;
          }

          if (typeof objective.progress !== "undefined") {
            bountyDataItem.progressToNextLevel = objective.progress;
          }

          if (typeof objective.objectiveProgressDescription !== "undefined") {
            // ${bountyDataItem.description}<br />
            bountyDataItem.description = `<b>${objective.objectiveProgressDescription}</b>`;
          }

          bountyData.push(bountyDataItem);
        }
      }
    }

    return bountyData;
  };

  const questItemType = 12;
  const questBucketHash = 1345459588;

  this.getQuests = function (namedObject) {
    let questData = [];

    var questItems = namedObject.characterInventory.filter(
      (item) =>
        item.bucketHash === questBucketHash &&
        [bountyItemType].filter((i) => i != item.inventoryitemItemType).length >
          0
    );

    let instancedQuestItems = questItems.filter(
      (item) => typeof item.itemInstanceId !== "undefined"
    );

    let uninstancedQuestItems = questItems.filter(
      (item) => typeof item.itemInstanceId === "undefined"
    );

    for (let instanceQuest of instancedQuestItems) {
      let itemObjectives = namedObject.itemComponents.objectives.data[
        instanceQuest.itemInstanceId
      ].objectives.filter(
        (objective) => objective.visible && !objective.complete
      );

      for (let objective of itemObjectives) {
        let questDataItem = {
          name: instanceQuest.inventoryitemName,
          description: instanceQuest.inventoryitemDescription,
          order: 1000,
          icon: instanceQuest.inventoryitemIcon,
          type: "quest",
          inProgressValueStyle: 0,
          completedValueStyle: 0,
        };

        if (typeof objective.completionValue !== "undefined") {
          questDataItem.nextLevelAt = objective.completionValue;

          if (typeof objective.objectiveInProgressValueStyle !== "undefined") {
            questDataItem.inProgressValueStyle =
              objective.objectiveInProgressValueStyle;
          }

          if (typeof objective.objectiveCompletedValueStyle !== "undefined") {
            questDataItem.completedValueStyle =
              objective.objectiveCompletedValueStyle;
          }

          if (typeof objective.progress !== "undefined") {
            questDataItem.progressToNextLevel = objective.progress;
          }

          if (typeof objective.objectiveProgressDescription !== "undefined") {
            // ${questDataItem.description}<br />
            questDataItem.description = `<b>${objective.objectiveProgressDescription}</b>`;
          }

          questData.push(questDataItem);
        }
      }
    }

    for (let uninstancedQuest of uninstancedQuestItems) {
      let questObjectives = (
        namedObject.characterProgression.uninstancedItemObjectives[
          uninstancedQuest.itemHash
        ] ?? []
      ).filter((objective) => objective.visible && !objective.complete);

      for (let objective of questObjectives) {
        let questDataItem = {
          name: uninstancedQuest.inventoryitemName,
          description: uninstancedQuest.inventoryitemDescription,
          order: 10000,
          icon: uninstancedQuest.inventoryitemIcon,
          type: "quest",
          inProgressValueStyle: 0,
          completedValueStyle: 0,
        };

        if (typeof objective.completionValue !== "undefined") {
          questDataItem.nextLevelAt = objective.completionValue;

          if (typeof objective.objectiveInProgressValueStyle !== "undefined") {
            questDataItem.inProgressValueStyle =
              objective.objectiveInProgressValueStyle;
          }

          if (typeof objective.objectiveCompletedValueStyle !== "undefined") {
            questDataItem.completedValueStyle =
              objective.objectiveCompletedValueStyle;
          }

          if (typeof objective.progress !== "undefined") {
            questDataItem.progressToNextLevel = objective.progress;
          }

          if (typeof objective.objectiveProgressDescription !== "undefined") {
            // ${questDataItem.description}<br />
            questDataItem.description = `<b>${objective.objectiveProgressDescription}</b>`;
          }

          questData.push(questDataItem);
        }
      }
    }

    return questData;
  };

  this.getCharacterRecords = function (namedObject) {
    let characterRecords = [];

    let characterRecordKeys = Object.keys(namedObject.characterRecords.records);
    for (let key of characterRecordKeys) {
      let characterRecord = namedObject.characterRecords.records[key];
      if (
        typeof characterRecord.objectives === "undefined" ||
        characterRecord.recordName.length === 0
      )
        continue;

      let recordObjectives = characterRecord.objectives.filter(
        (objective) => objective.visible && !objective.complete
      );

      for (let objective of recordObjectives) {
        let characterRecordData = {
          name: characterRecord.recordName,
          type: "characterRecord",
          order: 100,
          icon: characterRecord.recordIcon,
          // ${characterRecord.recordDescription}<br />
          description: `<b>${objective.objectiveProgressDescription ?? ""}</b>`,
          progressToNextLevel: objective.progress,
          nextLevelAt: objective.completionValue,
          inProgressValueStyle: objective.objectiveInProgressValueStyle,
          completedValueStyle: objective.objectiveCompletedValueStyle,
        };

        characterRecords.push(characterRecordData);
      }
    }

    return characterRecords;
  };

  return this;
}
