const { Meeting } = require("../config/sequelize");

// 📌 Get all meetings with pagination
exports.getAllMeetings = async (req, res) => {
  const { page = 1, limit = 20 } = req.query; // Default to page 1 and limit 20
  const offset = (page - 1) * limit; // Calculate offset

  try {
    const { count, rows: meetings } = await Meeting.findAndCountAll({
      limit: parseInt(limit), // Number of records to fetch
      offset: parseInt(offset), // Number of records to skip
      order: [["startTime", "DESC"]], // Optional: sort by startTime, latest first
    });

    const totalPages = Math.ceil(count / limit); // Calculate total pages

    res.status(200).json({
      meetings,
      pagination: {
        totalMeetings: count,
        currentPage: parseInt(page),
        totalPages,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Get meeting by ID
exports.getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    res.status(200).json(meeting);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    const meeting = await Meeting.create({
      title,
      description,
      startTime,
      endTime,
    });
    res.status(201).json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Update a meeting
exports.updateMeeting = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    let meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    await meeting.update({ title, description, startTime, endTime });
    res.status(200).json(meeting);
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Delete a meeting
exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    await meeting.destroy();
    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
