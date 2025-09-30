
const express = require("express");
const cors = require("cors"); // ✅ Add this
require("dotenv").config();
const dashboardRoutes = require("./routes/dashboardroutes");

const ttsRoute = require("./routes/ttsRoute");
const userReplyRoute = require("./routes/userReplyRoute");
const suggest = require("./routes/suggest");
const infoRoute = require("./routes/infoRoute");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(ttsRoute);
app.use(userReplyRoute);
app.use(suggest);
app.use(infoRoute);
app.use("/", dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server started on http://localhost:${PORT}`)
);