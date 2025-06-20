const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CloseLead = sequelize.define(
    "ProcessedFinal",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      freshLeadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Each FreshLead can be finaled only once
        references: {
          model: "freshleads", // ✅ matches actual table name
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
    },
    {
      tableName: "processed_final", // ✅ lowercase and consistent
      freezeTableName: true, // ✅ disables auto-pluralization
      timestamps: true,
    }
  );

  return CloseLead;
};
