import express from "express"
const app = express();
const port = 3001;

app.get('/', (req, res) => {
    console.log("ok")
    return res.send('AA xxx Hello World!')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));