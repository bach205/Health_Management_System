const app = require("./src/app");
const port = process.env.PORT || 8080;
const { initSocket } = require("./src/config/socket");

// connect to database
const db = require("./src/config/dbconnect");

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
initSocket(server);