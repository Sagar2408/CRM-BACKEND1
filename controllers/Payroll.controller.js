const { Op } = require("sequelize");
const {
  parseISO,
  format,
  eachDayOfInterval,
  getDay, // 0 = Sunday, 6 = Saturday
} = require("date-fns");

exports.generatePayroll = async (req, res) => {
  const { Payroll, Users, ExecutiveActivity } = req.db;

  try {
    const { executive_id, startDate, endDate, gross_salary } = req.body;
    let { designation } = req.body;

    // ✅ Default designation
    if (!designation) {
      designation = "Executive";
    }

    // ✅ Validate required fields
    if (!executive_id || !startDate || !endDate || !gross_salary) {
      return res.status(400).json({
        error:
          "executive_id, startDate, endDate, and gross_salary are required.",
      });
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const month = format(start, "yyyy-MM");

    // ✅ Generate working days excluding Sundays
    const allDays = eachDayOfInterval({ start, end });
    const workingDays = allDays.filter((date) => getDay(date) !== 0); // 0 = Sunday
    const totalWorkingDays = workingDays.length;

    // ✅ Validate Executive
    const executive = await Users.findByPk(executive_id);
    if (!executive || executive.role === "Admin") {
      return res
        .status(404)
        .json({ error: "Executive not found or is an Admin." });
    }

    // ✅ Fetch attendance logs (skip Sundays already)
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

    // ✅ Count present weekdays only
    const total_present_days = workingDays.reduce((count, date) => {
      const key = format(date, "yyyy-MM-dd");
      return presentDates.has(key) ? count + 1 : count;
    }, 0);

    const per_day_salary = gross_salary / totalWorkingDays;
    const deductions = (totalWorkingDays - total_present_days) * per_day_salary;
    const net_salary = gross_salary - deductions;

    // ✅ Check if payroll already exists — UPDATE if yes
    const existing = await Payroll.findOne({
      where: { executive_id, month },
    });

    if (existing) {
      await existing.update({
        designation,
        gross_salary,
        total_present_days,
        total_working_days: totalWorkingDays,
        deductions,
        net_salary,
      });

      return res.status(200).json({
        message: "Payroll updated successfully for executive",
        payroll: existing,
      });
    }

    // ✅ Else, create new payroll
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
    console.error("❌ Error generating payroll:", err.message);
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
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
