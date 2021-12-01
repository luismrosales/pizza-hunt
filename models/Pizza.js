const { Schema, model } = require("mongoose");

const pizzaSchema = new Schema({
  pizzaName: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  size: {
    type: String,
    default: "Large",
  },
  toppings: [],
});

// create pizza model using the pizzaSchema
const Pizza = model("Pizza", pizzaSchema);

// export the pizza model
module.exports = Pizza;
