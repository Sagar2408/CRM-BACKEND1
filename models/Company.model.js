const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Company = sequelize.define("Company", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Automatically generates UUIDv4
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    db_name: DataTypes.STRING,
    db_host: DataTypes.STRING,
    db_user: DataTypes.STRING,
    db_password: DataTypes.STRING,
    db_port: DataTypes.STRING,
  });

  return Company;
};
