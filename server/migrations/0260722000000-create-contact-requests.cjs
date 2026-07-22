"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("contact_requests", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: { type: Sequelize.STRING(80), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false },
      type: {
        type: Sequelize.ENUM("vitrine", "sur-mesure", "refonte", "autre"),
        allowNull: false,
      },
      description: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("contact_requests");
  },
};