const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getChannel } = require("../jobs/queue.js");

exports.uploadFiles = async (req, res) => {
  if (!req.files || !req.files.cv || !req.files.report) {
    return res.status(400).json({
      errors: "Please upload both CV and Report files",
    });
  }
  const cvFile = req.files.cv[0].filename;
  const reportFile = req.files.report[0].filename;

  const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

  const cvUrl = `${BASE_URL}/uploads/${cvFile}`;
  const reportUrl = `${BASE_URL}/uploads/${reportFile}`;

  const job = await prisma.evaluationResult.create({
    data: {
      jobId: Date.now().toString(),
      cvPath: cvUrl,
      reportPath: reportUrl,
      status: "queued",
    },
  });

  const channel = getChannel();
  if (!channel) {
    return res.status(500).json({ error: "Message queue not connected" });
  }

  channel.sendToQueue(
    "evaluation",
    Buffer.from(
      JSON.stringify({
        jobId: job.jobId,
        cvUrl: cvUrl,
        reportUrl: reportUrl,
      })
    )
  );

  console.log(`Job queued: ${job.jobId}, CV: ${cvUrl}, Report: ${reportUrl}`);

  res.json({
    cv_id: cvFile,
    report_id: reportFile,
    cv_url: cvUrl,
    report_url: reportUrl,
  });
};
