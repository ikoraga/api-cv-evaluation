const express = require("express");
const router = express.Router();
const upload = require("./middleware/upload");

const uploadController = require("./controllers/uploadController");
const evaluateController = require("./controllers/evaluateController");
const resultController = require("./controllers/resultController");

router.post(
  "/upload",
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "report", maxCount: 1 },
  ]),
  uploadController.uploadFiles
);

router.post("/evaluate", evaluateController.evaluate);
router.get("/result/:id", resultController.getResult);

module.exports = router;
