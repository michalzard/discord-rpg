const { help } = require("./help");
const { user } = require("./user");
const { adventure } = require("./adventure");
module.exports = {
  commands: {
    help,
    user,
    adventure,
  },
};
