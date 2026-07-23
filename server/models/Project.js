import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Project = sequelize.define(
  "Project",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    client: { type: DataTypes.STRING(150), allowNull: true },
    year: { type: DataTypes.INTEGER, allowNull: true },
    summary: { type: DataTypes.TEXT, allowNull: true },
    // stored as comma-separated text, exposed as an array by the controller
    services: { type: DataTypes.STRING(255), allowNull: true },
    stack: { type: DataTypes.STRING(255), allowNull: true },
    contexte: { type: DataTypes.TEXT, allowNull: true },
    besoin: { type: DataTypes.TEXT, allowNull: true },
    approche: { type: DataTypes.TEXT, allowNull: true },
    resultat: { type: DataTypes.TEXT, allowNull: true },
    link: { type: DataTypes.STRING(255), allowNull: true },
    status: {
      type: DataTypes.ENUM("brouillon", "publie"),
      allowNull: false,
      defaultValue: "brouillon",
    },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    tableName: "projects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    freezeTableName: true,
  },
);

export default Project;