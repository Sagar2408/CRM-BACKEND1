const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Lead = sequelize.define(
    "Lead",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      clientLeadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assignedToExecutive: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      previousAssignedTo: {
        type: DataTypes.STRING, // ✅ Add this field
        allowNull: true,
      },
      assignmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "New",
          "Assigned",
          "In Progress",
          "Follow-Up",
          "Closed",
          "Rejected"
        ),
        defaultValue: "New",
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

  return Lead;
};
