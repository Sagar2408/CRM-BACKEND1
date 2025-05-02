module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Company", {
    name: DataTypes.STRING,
    db_name: DataTypes.STRING,
    db_host: DataTypes.STRING,
    db_user: DataTypes.STRING,
    db_password: DataTypes.STRING,
    db_port: DataTypes.INTEGER,
  });
};
