const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    repliedAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.SchemaTypes.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

contactSchema.plugin(toJSON);
contactSchema.plugin(paginate);

contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;

