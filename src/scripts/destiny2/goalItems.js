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

      let milestoneDefinition =
        destinyApiClient.destinyDataDefinition.DestinyMilestoneDefinition[
          milestone.milestoneHash
        ];

      let milestoneDataItem = {
        name: milestone.milestoneName,
        description: milestone.milestoneDescription,
        order: milestone.order,
        icon: milestone.milestoneIcon,
        type: "milestone",
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

  return this;
}
