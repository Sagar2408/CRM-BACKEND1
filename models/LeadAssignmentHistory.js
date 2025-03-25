const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("LeadAssignmentHistory", {
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
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Executive assigned to the lead",
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
};
