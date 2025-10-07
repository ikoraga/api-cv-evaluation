-- AlterTable
ALTER TABLE `evaluationresult` MODIFY `cvMatchRate` DOUBLE NULL DEFAULT 0,
    MODIFY `cvFeedback` TEXT NULL,
    MODIFY `projectScore` DOUBLE NULL DEFAULT 0,
    MODIFY `projectFeedback` TEXT NULL,
    MODIFY `overallSummary` TEXT NULL;
