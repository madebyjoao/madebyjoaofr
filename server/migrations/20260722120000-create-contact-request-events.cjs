"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("contact_request_events", {
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
      type: {
        type: Sequelize.ENUM(
          "devis_envoye",
          "relance",
          "reponse_client",
          "appel",
          "note",
        ),
        allowNull: false,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      event_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      follow_up_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("contact_request_events");
  },
};
