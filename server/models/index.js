import ContactRequest from "./ContactRequest.js";
import ContactRequestImage from "./ContactRequestImage.js";
import ContactRequestEvent from "./ContactRequestEvent.js";
import Project from "./Project.js";
import ProjectImage from "./ProjectImage.js";


ContactRequest.hasMany(ContactRequestImage, {
  foreignKey: "contact_request_id",
  as: "images",
  onDelete: "CASCADE",
});
ContactRequestImage.belongsTo(ContactRequest, {
  foreignKey: "contact_request_id",
  as: "request",
});


ContactRequest.hasMany(ContactRequestEvent, {
  foreignKey: "contact_request_id",
  as: "events",
  onDelete: "CASCADE",
});
ContactRequestEvent.belongsTo(ContactRequest, {
  foreignKey: "contact_request_id",
  as: "request",
});

Project.hasMany(ProjectImage, {
  foreignKey: "project_id",
  as: "images",
  onDelete: "CASCADE",
});
ProjectImage.belongsTo(Project, { foreignKey: "project_id", as: "project" });

export {
  ContactRequest,
  ContactRequestImage,
  ContactRequestEvent,
  Project,
  ProjectImage,
};