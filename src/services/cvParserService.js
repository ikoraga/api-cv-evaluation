const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

exports.parsePDF = async (filePath) => {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(__dirname, "../", filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const dataBuffer = fs.readFileSync(absolutePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
};
