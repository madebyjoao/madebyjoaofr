"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projects", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      slug: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      title: { type: Sequelize.STRING(150), allowNull: false },
      client: { type: Sequelize.STRING(150), allowNull: true },
      year: { type: Sequelize.INTEGER, allowNull: true },
      summary: { type: Sequelize.TEXT, allowNull: true },
      services: { type: Sequelize.STRING(255), allowNull: true },
      stack: { type: Sequelize.STRING(255), allowNull: true },
      contexte: { type: Sequelize.TEXT, allowNull: true },
      besoin: { type: Sequelize.TEXT, allowNull: true },
      approche: { type: Sequelize.TEXT, allowNull: true },
      resultat: { type: Sequelize.TEXT, allowNull: true },
      link: { type: Sequelize.STRING(255), allowNull: true },
      status: {
        type: Sequelize.ENUM("brouillon", "publie"),
        allowNull: false,
        defaultValue: "brouillon",
      },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("projects");
  },
};