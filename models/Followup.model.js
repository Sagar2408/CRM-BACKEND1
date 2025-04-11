module.exports = (sequelize, DataTypes) => {
  const FollowUp = sequelize.define("FollowUp", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    connect_via: {
      type: DataTypes.ENUM("Call", "Email", "Call/Email"),
      allowNull: false,
    },
    follow_up_type: {
      type: DataTypes.ENUM(
        "interested",
        "appointment",
        "no response",
        "converted",
        "not interested",
        "close"
      ),
      allowNull: false,
    },
    interaction_rating: {
      type: DataTypes.ENUM("Hot", "Warm", "Cold"),
      allowNull: false,
    },
    reason_for_follow_up: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    follow_up_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    follow_up_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  });

  return FollowUp;
};
