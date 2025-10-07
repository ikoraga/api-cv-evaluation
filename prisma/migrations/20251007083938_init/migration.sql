-- CreateTable
CREATE TABLE `EvaluationResult` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `cvPath` VARCHAR(191) NOT NULL,
    `reportPath` VARCHAR(191) NOT NULL,
    `status` ENUM('queued', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'queued',
    `cvMatchRate` DOUBLE NOT NULL DEFAULT 0,
    `cvFeedback` TEXT NOT NULL,
    `projectScore` DOUBLE NOT NULL DEFAULT 0,
    `projectFeedback` TEXT NOT NULL,
    `overallSummary` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EvaluationResult_jobId_key`(`jobId`),
    INDEX `EvaluationResult_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
