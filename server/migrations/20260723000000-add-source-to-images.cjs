"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("contact_request_images", "source", {
      type: Sequelize.ENUM("client", "admin"),
      allowNull: false,
      defaultValue: "client",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("contact_request_images", "source");
  },
};