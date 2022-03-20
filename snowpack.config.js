module.exports = {
  mount: {
    src: "/",
    public: "/public/",
  },
  exclude: ["src/manifest.json"],
  buildOptions: {
    out: "./resources/compiled/",
  },
};
