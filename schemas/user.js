const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      trim: true,
      required: true,
    },
    class: {
      type: String,
      enum: ["Warrior", "Mage", "Rogue"],
      default: "Warrior",
    },
    // skills:{
    //   type:String,
    //   enum:[""]
    // }
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 0,
    },
    nextLevelXP: {
      type: Number,
      default: 200, // Will be calculated by level manager
    },
    currency: {
      coins: {
        type: Number,
        default: 0,
      },
    },
    revival:{
      remaining:{
        type:Number,
        default:3,
      },
      nextAvailable:{
        type:Date,
        default:Date.now(),
      }
    },
    stats: {
      //will be calculated by entitymanager
      hp: { type: Number, default: 100 },
      maxHp: { type: Number, default: 100 },
      stamina: { type: Number, default: 1 },
      strength: { type: Number, default: 1 },
      magic: { type: Number, default: 1 },
      dexterity: { type: Number, default: 1 },
      strength: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
