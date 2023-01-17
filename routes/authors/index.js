const express = require("express"),
    router = express.Router();

const { Author } = require("../../database").schemas;

router.get("/", async (req, res) => {
    const authors = await Author.find({});

    res.send(authors);
});
router.post("/", async (req, res) => {
    const { name, surname, email, dob } = req.body;

    if (!name || !surname || !email || !dob)
        return res.status(400).send({ err: "Missing fields" });

    const author = new Author({
        name,
        surname,
        dob,
        email,
    });

    author.save((err, doc) => {
        if (err) return res.status(500).send({ err: "DB Err" });
        res.send(doc);
    });
});

module.exports = router;
