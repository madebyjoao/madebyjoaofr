import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const ContactRequestEvent = sequelize.define(
  "ContactRequestEvent",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    contact_request_id: { type: DataTypes.INTEGER, allowNull: false },
    type: {
      type: DataTypes.ENUM("devis_envoye", "relance", "reponse_client", "appel", "note"),
      allowNull: false,
    },
    note: { type: DataTypes.TEXT, allowNull: true },
    event_date: { type: DataTypes.DATEONLY, allowNull: false },
    follow_up_date: { type: DataTypes.DATEONLY, allowNull: true },
  },
  {
    tableName: "contact_request_events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    freezeTableName: true,
  }
);

export default ContactRequestEvent;