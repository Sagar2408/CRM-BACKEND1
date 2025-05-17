const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FreshLead = sequelize.define(
    "FreshLead",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      leadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Leads",
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
      followUpDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      followUpStatus: {
        type: DataTypes.ENUM(
          "appointment",
          "no response",
          "interested",
          "converted",
          "not interested",
          "close"
        ),
        allowNull: true,
      },
      isChecked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      callStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "freshleads", // ✅ lowercase to match FK reference
      freezeTableName: true, // ✅ prevent Sequelize from auto-pluralizing
    }
  );

  return FreshLead;
};
