const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getChannel } = require("../jobs/queue");
const path = require("path");

exports.evaluate = async (req, res) => {
  try {
    const { cv_id, report_id } = req.body;

    // 🔸 Validasi input
    if (!cv_id || !report_id) {
      return res.status(400).json({
        error: "Missing required fields: cv_id and report_id",
      });
    }

    const jobId = Date.now().toString();
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

    const cvUrl = `${BASE_URL}/uploads/${cv_id}`;
    const reportUrl = `${BASE_URL}/uploads/${report_id}`;

    const cvLocalPath = path.join("public", "uploads", cv_id);
    const reportLocalPath = path.join("public", "uploads", report_id);

    console.log(`📥 New job ${jobId}`);
    console.log(`   ├── CV: ${cvLocalPath}`);
    console.log(`   └── Report: ${reportLocalPath}`);

    const newJob = await prisma.evaluationResult.create({
      data: {
        jobId,
        cvPath: cvUrl,
        reportPath: reportUrl,
        status: "queued",
      },
    });

    const channel = getChannel();
    if (!channel) {
      console.error("❌ RabbitMQ channel not available");
      await prisma.evaluationResult.update({
        where: { jobId },
        data: { status: "failed" },
      });
      return res.status(500).json({ error: "Queue service unavailable" });
    }

    channel.sendToQueue(
      "evaluation",
      Buffer.from(
        JSON.stringify({
          jobId,
          cvPath: cvLocalPath,
          reportPath: reportLocalPath,
        })
      )
    );

    console.log(`📤 Job ${jobId} successfully queued`);

    return res.status(200).json({
      id: jobId,
      status: "queued",
    });
  } catch (error) {
    console.error("❌ Error in /evaluate:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
