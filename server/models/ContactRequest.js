import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const ContactRequest = sequelize.define(
  "ContactRequest",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(80), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, validate: { isEmail: true } },
    type: {
      type: DataTypes.ENUM("vitrine", "sur-mesure", "refonte", "autre"),
      allowNull: false,
    },
    description: { type: DataTypes.TEXT, allowNull: false },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    phone_secondary: { type: DataTypes.STRING(30), allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: true },
    current_website: { type: DataTypes.STRING(255), allowNull: true },
    budget: { type: DataTypes.STRING(100), allowNull: true },
    status: {
      type: DataTypes.ENUM(
        "nouveau", "lu", "en_discussion", "devis_envoye",
        "accepte", "refuse", "archive"
      ),
      allowNull: false,
      defaultValue: "nouveau",
    },
    quote_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    approved_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    timeline: { type: DataTypes.STRING(255), allowNull: true },
    follow_up_date: { type: DataTypes.DATEONLY, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "contact_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    freezeTableName: true,
  }
);

export default ContactRequest;