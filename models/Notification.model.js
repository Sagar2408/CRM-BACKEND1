const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define("Notification", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // This assumes "Users" table exists and is correctly synced
        key: "id",
      },
      onDelete: "CASCADE",
    },
    targetRole: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "executive",
    },
    message: {
      type: DataTypes.STRING(255), // Ensure this fits your message length
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  });

  return Notification;
};
