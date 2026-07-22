"use strict";

// Adds the CRM/deal-flow columns to the existing contact_requests table.
// Runs AFTER the original create-contact-requests migration.

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("contact_requests", "phone", {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
    await queryInterface.addColumn("contact_requests", "phone_secondary", {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
    await queryInterface.addColumn("contact_requests", "address", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("contact_requests", "current_website", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("contact_requests", "budget", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn("contact_requests", "status", {
      type: Sequelize.ENUM(
        "nouveau",
        "lu",
        "en_discussion",
        "devis_envoye",
        "accepte",
        "refuse",
        "archive",
      ),
      allowNull: false,
      defaultValue: "nouveau",
    });
    await queryInterface.addColumn("contact_requests", "quote_amount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn("contact_requests", "approved_amount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn("contact_requests", "timeline", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("contact_requests", "follow_up_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("contact_requests", "notes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    for (const col of [
      "phone",
      "phone_secondary",
      "address",
      "current_website",
      "budget",
      "status",
      "quote_amount",
      "approved_amount",
      "timeline",
      "follow_up_date",
      "notes",
    ]) {
      await queryInterface.removeColumn("contact_requests", col);
    }
  },
};
