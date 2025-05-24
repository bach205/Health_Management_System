const app = require("./src/app");

const port = process.env.PORT || 3000;

// connect to database

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
