const app = require("./src/app");
const port = process.env.PORT || 8080;

// connect to database
const db = require("./src/config/dbconnect");

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//n