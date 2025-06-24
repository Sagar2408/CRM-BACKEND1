const createLeaveApplication = async (req, res) => {
  try {
    const { LeaveApplication, Users } = req.db;
    const employeeId = req.user?.id;
    const role = req.user?.role;

    if (!employeeId) {
      return res.status(404).json({ error: "EmployeeId or Role not found" });
    }

    const {
      fullName,
      positionTitle,
      leaveType,
      startDate,
      endDate,
      totalDays,
      appliedDate,
      reason,
      emergencyContactName,
      emergencyPhone,
      workHandoverTo,
      handoverNotes,
      supportingDocumentPath,
    } = req.body;

    // ✅ Validation
    if (
      !employeeId ||
      !fullName ||
      !role ||
      !positionTitle ||
      !leaveType ||
      !startDate ||
      !endDate ||
      !totalDays ||
      !appliedDate ||
      !reason ||
      !emergencyContactName ||
      !emergencyPhone
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Ensure employee exists
    const user = await Users.findByPk(employeeId);
    if (!user) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // ✅ Create leave application
    const newLeave = await LeaveApplication.create({
      employeeId,
      fullName,
      role,
      positionTitle,
      leaveType,
      startDate,
      endDate,
      totalDays,
      appliedDate,
      reason,
      emergencyContactName,
      emergencyPhone,
      workHandoverTo,
      handoverNotes,
      supportingDocumentPath,
    });

    return res.status(201).json({
      message: "Leave application submitted successfully",
      data: newLeave,
    });
  } catch (error) {
    console.error("Create leave error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getLeaveApplication = async (req, res) => {
  try {
    const { LeaveApplication, Users } = req.db;
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({ error: "Missing employeeId in query" });
    }

    const employee = await Users.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const leaves = await LeaveApplication.findAll({
      where: { employeeId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(leaves);
  } catch (error) {
    console.error("Get leave error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createLeaveApplication,
  getLeaveApplication,
};
