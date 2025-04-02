const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ExecutiveActivity",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ExecutiveId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Ensure Users model exists
          key: "id",
        },
        onDelete: "CASCADE",
      },
      workTime: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      breakTime: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      dailyCallTime: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      leadSectionVisits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      workStartTime: {
        type: DataTypes.DATE,
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
      timestamps: true, // Automatically manages createdAt & updatedAt
    }
  );
};
