const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CloseLead = sequelize.define("CloseLead", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    freshLeadId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Make sure each FreshLead can be closed only once
      references: {
        model: "FreshLeads", // should match the actual table name or model name
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return CloseLead;
};
