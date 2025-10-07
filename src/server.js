const express = require("express");
const app = express();
const routes = require("./route");

require("./worker")

app.use(express.json());
app.use("/uploads", express.static("public/uploads"));
app.use("/", routes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
