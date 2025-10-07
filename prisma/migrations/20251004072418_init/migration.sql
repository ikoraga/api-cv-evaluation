-- CreateTable
CREATE TABLE `EvaluationResult` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `cvPath` VARCHAR(191) NOT NULL,
    `reportPath` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'queued',
    `cvMatchRate` DOUBLE NULL,
    `cvFeedback` VARCHAR(191) NULL,
    `projectScore` DOUBLE NULL,
    `projectFeedback` VARCHAR(191) NULL,
    `overallSummary` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EvaluationResult_jobId_key`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
