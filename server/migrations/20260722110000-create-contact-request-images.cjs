"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("contact_request_images", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      contact_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "contact_requests", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      path: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("contact_request_images");
  },
};
