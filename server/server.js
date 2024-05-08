const express = require("express");

const usersRoute = require("./routes/users.route");
const projectsRoute = require("./routes/projects.route");
const tasksRoute = require("./routes/tasks.route");
const notificationsRoute = require("./routes/notifications.route");

const db = require("./config/database.config");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/users", usersRoute);
app.use("/api/projects", projectsRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/notifications", notificationsRoute);

// deployment config
const path = require("path");
__dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

app.listen(port, () => console.log(`Server has started on port ${port}!`));
