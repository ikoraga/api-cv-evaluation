const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getResult = async (req, res) => {
  const { id } = req.params;
  const job = await prisma.evaluationResult.findUnique({
    where: { jobId: id },
  });

  if (!job) return res.status(404).json({ error: "Job not found" });

  if (["queued", "processing", "failed"].includes(job.status)) {
    return res.status(200).json({ id: job.jobId, status: job.status });
  }

  res.json({
    id: job.jobId,
    status: job.status,
    result: {
      cv_match_rate: job.cvMatchRate,
      cv_feedback: job.cvFeedback,
      project_score: job.projectScore,
      project_feedback: job.projectFeedback,
      overall_summary: job.overallSummary,
    },
  });
};
