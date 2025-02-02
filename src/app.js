const express = require("express");
const app = express();
app.use("/test/data", (req, res) => {
    res.send("Hello from server-data");
});
app.use("/test", (req, res) => {
    res.send("Hello from server");
});
app.use("/profile", (req, res) => {
    res.send("not created yet");
});
app.use("/", (req, res) => {
    res.send("hello dosto me hu server");
});//find out by on keeping on the top the other routes were not showing their responses

app.listen(3000, () => {
    console.log("server successfully running on port 3000");
})