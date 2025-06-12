const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const EmailTemplate = sequelize.define(
    "EmailTemplate",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", // 👈 matches the User model table name
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "email_templates",
      freezeTableName: true,
      timestamps: true,
    }
  );
  return EmailTemplate;
};
