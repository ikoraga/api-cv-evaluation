require("dotenv").config();
const amqp = require("amqplib");
const path = require("path");
const { parsePDF } = require("./services/cvParserService");
const {
  askLLMAboutCV,
  askLLMAboutProject,
  askLLMFinalSummary,
} = require("./services/llmService");
const { PrismaClient } = require("@prisma/client");
const { calculateOverallScore } = require("./services/scoreService");

const prisma = new PrismaClient();
const QUEUE = "evaluation";

(async () => {
  try {
    const conn = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST || "localhost",
      port: process.env.RABBITMQ_PORT || 5672,
      username: process.env.RABBITMQ_USER || "admin",
      password: process.env.RABBITMQ_PASS || "admin123",
    });
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE);

    console.log("Worker connected to RabbitMQ, waiting for messages...");

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;

      const job = JSON.parse(msg.content.toString());
      console.log(`Received job:`, job);

      try {
        await prisma.evaluationResult.update({
          where: { jobId: job.jobId },
          data: { status: "processing" },
        });
        console.log(`Job ${job.jobId} set to processing`);

        let cvPath = job.cvPath;
        let reportPath = job.reportPath;

        if (job.cvUrl) {
          const cvFile = path.basename(job.cvUrl);
          cvPath = path.join(__dirname, "public", "uploads", cvFile);
        }
        if (job.reportUrl) {
          const reportFile = path.basename(job.reportUrl);
          reportPath = path.join(__dirname, "public", "uploads", reportFile);
        }

        console.log(`Parsing CV from: ${cvPath}`);
        const cvText = await parsePDF(cvPath);

        console.log(`Parsing Project Report from: ${reportPath}`);
        const reportText = await parsePDF(reportPath);

        console.log(`Sending CV to LLM for evaluation...`);
        const cvResult = await askLLMAboutCV(cvText);

        console.log(`Sending Project Report to LLM for evaluation...`);
        const projectResult = await askLLMAboutProject(reportText);

        const overallScore = calculateOverallScore(
          cvResult.score,
          projectResult.score
        );
        console.log("Evaluated scores:", overallScore);

        const finalSummary = await askLLMFinalSummary(cvResult, projectResult);
        console.log("Final summary:", finalSummary);

        const updated = await prisma.evaluationResult.update({
          where: { jobId: job.jobId },
          data: {
            status: "completed",
            cvFeedback: cvResult.feedback,
            projectFeedback: projectResult.feedback,
            cvMatchRate: cvResult.score,
            projectScore: projectResult.score,
            overallSummary: finalSummary,
          },
        });

        console.log(`Job ${job.jobId} completed & saved to DB`);
        console.log(updated);

        channel.ack(msg);
      } catch (err) {
        console.error(`Error processing job ${job.jobId}:`, err);

        await prisma.evaluationResult.update({
          where: { jobId: job.jobId },
          data: { status: "failed" },
        });

        channel.nack(msg, false, false);
      }
    });
  } catch (err) {
    console.error("Worker fatal error:", err);
    process.exit(1);
  }
})();
