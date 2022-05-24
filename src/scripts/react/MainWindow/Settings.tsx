import React, { useEffect } from "react";
import { EventEmitter } from "../../eventEmitter";
import { Destiny2Database } from "../../indexedDB";

const backgroundWindow = overwolf.windows.getMainWindow();
const eventEmitter = (backgroundWindow as any).eventEmitter as EventEmitter;
const db = (backgroundWindow as any).db as Destiny2Database;

export function Settings() {
  useEffect(() => {
    loadSettings().then(() => {
      document.getElementById("visibleItems").addEventListener("change", async (event) => {
        await db.setItem("d2-visible-items", event.target.value);
        eventEmitter.emit("visible-items-changed", parseInt(event.target.value));
      });

      document.getElementById("trackSeasonRank").addEventListener("change", async function (event) {
        let checked = event.target.checked;
        await db.setItem("d2-track-seasonrank", checked);
        eventEmitter.emit("tracked-items-changed");
      });

      document.getElementById("trackMilestones").addEventListener("change", async function (event) {
        let checked = event.target.checked;
        await db.setItem("d2-track-milestones", checked);
        eventEmitter.emit("tracked-items-changed");
      });

      document.getElementById("trackBounties").addEventListener("change", async function (event) {
        let checked = event.target.checked;
        await db.setItem("d2-track-bounties", checked);
        eventEmitter.emit("tracked-items-changed");
      });

      document.getElementById("trackQuests").addEventListener("change", async function (event) {
        let checked = event.target.checked;
        await db.setItem("d2-track-quests", checked);
        eventEmitter.emit("tracked-items-changed");
      });

      document.getElementById("trackRecords").addEventListener("change", async function (event) {
        let checked = event.target.checked;
        await db.setItem("d2-track-records", checked);
        eventEmitter.emit("tracked-items-changed");
      });

      document.getElementById("debugMode").addEventListener("change", async function (event) {
        let checked = event.target.checked;
        await db.setItem("d2-debugmode", checked);
        eventEmitter.emit("debug-changed", checked);
      });
    });
  });

  async function loadSettings() {
    document.getElementById("visibleItems").value = await db.getItem("d2-visible-items");

    document.getElementById("trackSeasonRank").checked = JSON.parse(
      ((await db.getItem("d2-track-seasonrank")) ?? "true").toString()
    )
      ? "checked"
      : "";

    document.getElementById("trackMilestones").checked = JSON.parse(
      ((await db.getItem("d2-track-milestones")) ?? "true").toString()
    )
      ? "checked"
      : "";
    document.getElementById("trackBounties").checked = JSON.parse(
      ((await db.getItem("d2-track-bounties")) ?? "true").toString()
    )
      ? "checked"
      : "";
    document.getElementById("trackQuests").checked = JSON.parse(
      ((await db.getItem("d2-track-quests")) ?? "true").toString()
    )
      ? "checked"
      : "";
    document.getElementById("trackRecords").checked = JSON.parse(
      ((await db.getItem("d2-track-records")) ?? "true").toString()
    )
      ? "checked"
      : "";

    document.getElementById("debugMode").checked = JSON.parse(
      ((await db.getItem("d2-debugmode")) ?? "false").toString()
    )
      ? "checked"
      : "";
  }

  return (
    <div className="tab-pane fade" id="settings" role="tabpanel" aria-labelledby="settings-tab">
      <div className="row h-100">
        <div className="col-12 pt-2">
          <div className="card text-white mb-3">
            <div className="card-header fui sub-title">TRACKING SETTINGS</div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <h3>SETTINGS</h3>
                  <div className="form-group">
                    <label htmlFor="visibleItems">Max visible items in overlay</label>
                    <input type="number" className="form-control" id="visibleItems" min="0" required placeholder="0" />
                    <small className="form-text text-muted">
                      Limits how many items will be shown at maximum in the overlay.
                      <br />
                      <kbd>0</kbd> means "All items", <kbd>1</kbd> means "Season rank" only
                    </small>
                  </div>
                  <h4>What do you want the overlay to track?</h4>
                  <small className="form-text text-muted mb-2">
                    Configures what items you want to show in the overlay
                  </small>
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="trackSeasonRank" />
                    <label htmlFor="trackSeasonRank" className="form-check-label">
                      Season Rank
                    </label>
                  </div>
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="trackMilestones" />
                    <label htmlFor="trackMilestones" className="form-check-label">
                      Milestones
                    </label>
                  </div>
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="trackBounties" />
                    <label htmlFor="trackBounties" className="form-check-label">
                      Bounties
                    </label>
                  </div>
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="trackQuests" />
                    <label htmlFor="trackQuests" className="form-check-label">
                      Quests
                    </label>
                  </div>
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="trackRecords" />
                    <label htmlFor="trackRecords" className="form-check-label">
                      Records
                    </label>
                  </div>
                </div>
                <div className="col-6">
                  <h3>SUPPORT</h3>
                  <a href="https://discord.gg/ZAMNfRpRDb" target="_blank>">
                    <img
                      src="../../images/Discord-Logo-White.svg"
                      alt="Discord link"
                      style={{ width: "24px", height: "24px" }}
                    />
                    Discord
                  </a>
                  <p className="form-text">
                    For support on Destiny 2 Goal Tracker, join our Discord server. If you are in need of assistance,
                    contact NoLifeKing in our support Discord.
                  </p>
                  <p className="form-text">
                    You may be asked to collect the log files located at{" "}
                    <code className="selectable-text">%localappdata%\Overwolf\Log</code> and zip up the folder so we can
                    get you back to achieving your goals.
                  </p>
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="debugMode" />
                    <label htmlFor="debugMode" className="form-check-label">
                      Enable debug mode
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
