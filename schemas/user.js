const mongoose = require("mongoose"); //.set("debug", true);
// const Item = require("./item");
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
    abilities: [],
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
    revival: {
      remaining: {
        type: Number,
        default: 3,
      },
      nextAvailable: {
        type: Date,
        default: Date.now(),
      },
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
    inventory: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.methods.addItem = function addItem(item) {
  if (this.inventory.length == 0) {
    this.inventory.push(item);
  } else {
    for (let i = 0; i < this.inventory.length; i++) {
      const invItem = this.inventory[i];
      //if found the same item in add quantity
      // if(item && invItem)
      if (item.item_id === invItem.item_id) {
        if (invItem.quantity + item.quantity <= invItem.quantityMax) {
          invItem.quantity += item.quantity;
        } else {
          invItem.quantity = invItem.quantityMax;
        }
      }
    }
  }

  //save inventory changes
  this.markModified("inventory");
  this.save((err, obj) => console.log(err, obj));
};

/**
 * {
    name: { type: String, default: "Attack" },
    damage: { type: Number, default: 10 },
   },
 */

const Abilities = [
  {
    class: "Warrior",
    name: "Heroic Strike",
    icon: ":man_superhero:",
    damage: 10,
  },
  {
    class: "Mage",
    name: "Fireball",
    icon: ":fire:",
    damage: 15,
  },
  {
    class: "Mage",
    name: "Frostbolt",
    icon: ":fireworks:",
    damage: 10,
  },
  {
    class: "Rogue",
    name: "Backstab",
    icon: "🗡️",
    damage: 11,
  },
  {
    class: "Rogue",
    name: "Slash",
    icon: "🗡️",
    damage: 8, //todo:bleed
  },
];

userSchema.pre("save", function () {
  const classAbilities = Abilities.filter(
    (ability) => ability.class === this.class || ability.class === "All"
  );

  this.abilities = [];
  this.abilities.push(
    {
      class: "All",
      name: "Attack",
      icon: "⚔️",
      damage: 10,
    },
    ...classAbilities
  );
});

module.exports = mongoose.model("User", userSchema);
