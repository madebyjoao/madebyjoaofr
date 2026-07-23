"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("project_images", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "projects", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      path: { type: Sequelize.STRING(255), allowNull: false },
      original_name: { type: Sequelize.STRING(255), allowNull: true },
      alt: { type: Sequelize.STRING(255), allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("project_images");
  },
};