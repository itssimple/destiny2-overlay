
const classNames = ["warlock", "titan", "hunter", "default"];
let i = 0;

const changeClass = () => {
  const container = document.querySelector(".loading-indicator .container");
  if(container) {
    container.classList.remove(classNames[i]);
    i = i < classNames.length - 1 ? i + 1 : 0;
    container.classList.add(classNames[i]);

    setTimeout(changeClass, 3000);
  }
};

setTimeout(changeClass, 100);