const { loadCommands } = require("./mod.js");

class OBSMod {
  constructor(mod) {
    loadCommands(mod);
  }

  destructor() {}
}

module.exports = OBSMod;
