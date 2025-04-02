const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ExecutiveActivity = sequelize.define(
    "ExecutiveActivity",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Ensure this matches your Users table
          key: "id",
        },
      },
      workTime: {
        type: DataTypes.INTEGER, // Storing work time in minutes
        defaultValue: 0,
      },
      breakTime: {
        type: DataTypes.INTEGER, // Storing break time in minutes
        defaultValue: 0,
      },
      dailyCallTime: {
        type: DataTypes.INTEGER, // Storing daily call time in minutes
        defaultValue: 0,
      },
      leadSectionVisits: {
        type: DataTypes.INTEGER, // Counting visits to the lead section
        defaultValue: 0,
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
      timestamps: true,
    }
  );

  return ExecutiveActivity;
};
