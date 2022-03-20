import React, { useEffect } from "react";

import "../../../public/css/loading.css";

export function LoadingIndicator() {
  useEffect(() => {
    const classNames = ["warlock", "titan", "hunter", "default"];
    let i = 0;

    const changeClass = () => {
      const container = document.querySelector(".loading-indicator .container");
      if (container) {
        container.classList.remove(classNames[i]);
        i = i < classNames.length - 1 ? i + 1 : 0;
        container.classList.add(classNames[i]);

        setTimeout(changeClass, 3000);
      }
    };

    setTimeout(changeClass, 100);
  }, []);

  return (
    <div className="loading-indicator">
      <div className="container warlock">
        <div className="circle c1"></div>
        <div className="circle c2"></div>
        <div className="circle c3"></div>
        <div className="circle c4"></div>
        <div className="shape_group">
          <div className="shape s1"></div>
          <div className="shape s2"></div>
          <div className="shape s3"></div>
          <div className="shape s4"></div>
          <div className="shape s5"></div>
          <div className="shape s6"></div>
        </div>
        <div className="line_group g1">
          <div className="line l1"></div>
          <div className="line l2"></div>
          <div className="line l3"></div>
          <div className="line l4"></div>
        </div>
        <div className="line_group g2">
          <div className="line l1"></div>
          <div className="line l2"></div>
          <div className="line l3"></div>
          <div className="line l4"></div>
        </div>
        <div className="line_group g3">
          <div className="line l1"></div>
          <div className="line l2"></div>
          <div className="line l3"></div>
          <div className="line l4"></div>
        </div>
      </div>
    </div>
  );
}
