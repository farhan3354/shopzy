import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  values: [{ type: String }],
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
  Fieldtype: { type: String },
});

const Attribute = mongoose.model("Attribute", attributeSchema);
export default Attribute;
