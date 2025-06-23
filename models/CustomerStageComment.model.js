// models/StageComment.model.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "StageComment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_stage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "customer_stages",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      stageNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 15,
        },
        comment: "Stage number from 1 to 15",
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      commentDateTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "stage_comments",
      freezeTableName: true,
      timestamps: true, // Optional, enables createdAt/updatedAt
    }
  );
};
