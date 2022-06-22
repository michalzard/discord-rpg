const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const ItemSchema = new mongoose.Schema({
  item_id: {
    type: Number,
    default: 1,
  },
  icon: {
    name: {
      type: String,
      default: "icon_name",
    },
    id:{
      type:String,
      default:"123456789",
    }
  },
  name: {
    type: String,
    default: "Item Name",
  },
  quantity: {
    type: Number,
    default: 1,
  },
  quantityMax: {
    type: Number,
    default: 5,
  },
  rarity: {
    type: String,
    enum: ["common","rare","epic","legendary"],
    default: "common",
  },
});

ItemSchema.plugin(AutoIncrement, { id: "item_seq", inc_field: "item_id" });

module.exports = mongoose.model("Item", ItemSchema);
