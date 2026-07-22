import ContactRequest from "./ContactRequest.js";
import ContactRequestImage from "./ContactRequestImage.js";
import ContactRequestEvent from "./ContactRequestEvent.js";

// a request has many images; each image belongs to one request
ContactRequest.hasMany(ContactRequestImage, {
  foreignKey: "contact_request_id",
  as: "images",
  onDelete: "CASCADE",
});
ContactRequestImage.belongsTo(ContactRequest, {
  foreignKey: "contact_request_id",
  as: "request",
});

// a request has many events; each event belongs to one request
ContactRequest.hasMany(ContactRequestEvent, {
  foreignKey: "contact_request_id",
  as: "events",
  onDelete: "CASCADE",
});
ContactRequestEvent.belongsTo(ContactRequest, {
  foreignKey: "contact_request_id",
  as: "request",
});

export { ContactRequest, ContactRequestImage, ContactRequestEvent };