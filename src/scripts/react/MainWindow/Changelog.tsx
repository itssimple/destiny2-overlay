import React, { useEffect, useState } from "react";

export function Changelog() {
  const [changelog, setChangelog] = useState("changelog");

  useEffect(() => {
    fetch("../../../public/changelog.html").then(async (response) => setChangelog(await response.text()));
  }, []);
  return (
    <div className="tab-pane fade" id="changelog" role="tabpanel" aria-labelledby="changelog-tab">
      <div className="row h-100">
        <div className="col-12 pt-2">
          <div className="card text-white mb-3">
            <div className="card-header fui sub-title">WHAT HAPPENS IN THE UPDATES?</div>
            <div
              className="card-body"
              id="changelog-cardbody"
              style={{
                minHeight: "527px",
                maxHeight: "527px",
                overflow: "auto",
              }}
              dangerouslySetInnerHTML={{ __html: changelog }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
