const { Op } = require("sequelize");
const { parseISO, format, eachDayOfInterval } = require("date-fns");

exports.generatePayroll = async (req, res) => {
  const { Payroll, Users, ExecutiveActivity } = req.db;

  try {
    const { startDate, endDate, grossSalaryMap, designationMap } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate are required in the request body.",
      });
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const totalWorkingDays = eachDayOfInterval({ start, end }).length;
    const month = format(start, "yyyy-MM");

    // Step 1: Get all eligible executives
    const executives = await Users.findAll({
      where: {
        role: { [Op.ne]: "Admin" },
      },
      attributes: ["id", "username"],
    });

    // Step 2: Fetch ExecutiveActivity logs within the range
    const logs = await ExecutiveActivity.findAll({
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
    });

    // Step 3: Map logs by executive and date
    const logsMap = {};
    logs.forEach((log) => {
      const date = format(new Date(log.createdAt), "yyyy-MM-dd");
      if (!logsMap[log.ExecutiveId]) logsMap[log.ExecutiveId] = {};
      logsMap[log.ExecutiveId][date] = log;
    });

    // Step 4: Build and insert payroll for each executive
    const payrolls = [];

    for (const executive of executives) {
      const { id: executive_id, username } = executive;
      const attendanceDates = logsMap[executive_id]
        ? Object.keys(logsMap[executive_id])
        : [];
      const total_present_days = attendanceDates.length;

      const gross_salary = grossSalaryMap?.[executive_id] || 0;
      const designation = designationMap?.[executive_id] || "Unknown";

      const per_day_salary = gross_salary / totalWorkingDays;
      const deductions =
        (totalWorkingDays - total_present_days) * per_day_salary;
      const net_salary = gross_salary - deductions;

      const alreadyExists = await Payroll.findOne({
        where: { executive_id, month },
      });

      if (!alreadyExists) {
        const payroll = await Payroll.create({
          executive_id,
          designation,
          gross_salary,
          total_present_days,
          total_working_days: totalWorkingDays,
          deductions,
          net_salary,
          month,
        });

        payrolls.push(payroll);
      } else {
        console.log(
          `Skipping existing payroll for executive ${username} (${executive_id}) for month ${month}`
        );
      }
    }

    res.status(201).json({
      message: "Payroll generated successfully",
      generatedCount: payrolls.length,
      payrolls,
    });
  } catch (err) {
    console.error("❌ Payroll generation failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.generateSinglePayroll = async (req, res) => {
  const { Payroll, Users, ExecutiveActivity } = req.db;

  try {
    const { executive_id, startDate, endDate, gross_salary, designation } =
      req.body;

    if (
      !executive_id ||
      !startDate ||
      !endDate ||
      !gross_salary ||
      !designation
    ) {
      return res.status(400).json({
        error:
          "executive_id, startDate, endDate, gross_salary, and designation are required.",
      });
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const totalWorkingDays = eachDayOfInterval({ start, end }).length;
    const month = format(start, "yyyy-MM");

    // Validate Executive
    const executive = await Users.findByPk(executive_id);
    if (!executive || executive.role === "Admin") {
      return res
        .status(404)
        .json({ error: "Executive not found or is an Admin." });
    }

    // Fetch attendance logs
    const logs = await ExecutiveActivity.findAll({
      where: {
        ExecutiveId: executive_id,
        createdAt: {
          [Op.between]: [start, end],
        },
      },
    });

    const presentDates = new Set(
      logs.map((log) => format(new Date(log.createdAt), "yyyy-MM-dd"))
    );
    const total_present_days = presentDates.size;

    const per_day_salary = gross_salary / totalWorkingDays;
    const deductions = (totalWorkingDays - total_present_days) * per_day_salary;
    const net_salary = gross_salary - deductions;

    // Check if payroll already exists
    const existing = await Payroll.findOne({
      where: { executive_id, month },
    });

    if (existing) {
      return res.status(409).json({
        error: `Payroll already exists for executive_id ${executive_id} in month ${month}`,
      });
    }

    // Create payroll record
    const payroll = await Payroll.create({
      executive_id,
      designation,
      gross_salary,
      total_present_days,
      total_working_days: totalWorkingDays,
      deductions,
      net_salary,
      month,
    });

    res.status(201).json({
      message: "Payroll generated successfully for executive",
      payroll,
    });
  } catch (err) {
    console.error("❌ Error generating single payroll:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllPayrolls = async (req, res) => {
  const { Payroll, Users } = req.db;

  try {
    const { month } = req.query; // Optional filter: ?month=2025-07

    const whereClause = {};
    if (month) {
      whereClause.month = month;
    }

    const payrolls = await Payroll.findAll({
      where: whereClause,
      include: {
        model: Users,
        as: "executive",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
      order: [["month", "DESC"]],
    });

    res.json({ count: payrolls.length, payrolls });
  } catch (err) {
    console.error("❌ Error fetching payrolls:", err);
    res.status(500).json({ error: "Failed to retrieve payrolls" });
  }
};

exports.getPayrollForExecutive = async (req, res) => {
  const { Payroll, Users } = req.db;

  try {
    const { executive_id, month } = req.query;

    if (!executive_id || !month) {
      return res.status(400).json({
        error: "executive_id and month (YYYY-MM) query params are required",
      });
    }

    const payroll = await Payroll.findOne({
      where: {
        executive_id,
        month,
      },
      include: {
        model: Users,
        as: "executive",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
    });

    if (!payroll) {
      return res.status(404).json({ error: "Payroll not found" });
    }

    res.json({ payroll });
  } catch (err) {
    console.error("❌ Error fetching payroll:", err);
    res.status(500).json({ error: "Failed to retrieve payroll record" });
  }
};
