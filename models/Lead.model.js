const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
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
        references: {
          model: "ClientLeads", // Foreign key reference to ClientLead table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      assignedToExecutive: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Name of the executive assigned to the lead",
      },
      assignmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
        defaultValue: "Assigned",
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
};
