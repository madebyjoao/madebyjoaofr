import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const ContactRequestImage = sequelize.define(
  "ContactRequestImage",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    contact_request_id: { type: DataTypes.INTEGER, allowNull: false },
    path: { type: DataTypes.STRING(255), allowNull: false },
    original_name: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: "contact_request_images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    freezeTableName: true,
  }
);

export default ContactRequestImage;