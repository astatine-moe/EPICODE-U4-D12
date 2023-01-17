const express = require("express"),
    mongoose = require("mongoose"),
    router = express.Router();

const { BlogPost } = require("../../database").schemas;

router.get("/", async (req, res) => {
    const posts = await BlogPost.find({}).populate("author");

    res.send(posts);
});
router.get("/:blog_id", async (req, res) => {
    const { blog_id } = req.params;

    if (!mongoose.isValidObjectId(blog_id))
        return res.status(400).send({ err: "Must be a valid ID" });

    const post = await BlogPost.findById(req.params.blog_id).populate("author");

    if (!post) return res.status(404).send({ err: "Blog post does not exist" });

    res.send(post);
});
router.post("/", async (req, res) => {
    let { category, title, cover, author_id, content } = req.body;

    if (!category) {
        category = "NEWS";
    }
    if (!title || !cover || !author_id || !content)
        return res.status(400).send({
            error: "Must include required fields (title, cover, author, content)",
        });

    if (!mongoose.isValidObjectId(author_id))
        return res.status(400).send({ err: "Must be a valid author ID" });

    const newPost = new BlogPost({
        title,
        category,
        content,
        cover,
        author: author_id,
    });

    newPost.save((err, post) => {
        if (err)
            return res.status(500).send({
                err: "Database error",
            });
        res.send(post);
    });
});
router.put("/:blog_id", async (req, res) => {
    const { blog_id } = req.params;

    if (!mongoose.isValidObjectId(blog_id))
        return res.status(400).send({ err: "Must be a valid ID" });

    const { title, cover, content, category } = req.body;

    const newData = { title, cover, content, category };

    BlogPost.findByIdAndUpdate(
        blog_id,
        {
            $set: {
                ...newData,
            },
        },
        {
            new: true, //return new doc
        }
    )
        .then((doc) => {
            res.send(doc);
        })
        .catch((err) => {
            if (err)
                return res.status(500).send({
                    err: "Database error",
                });
        });
});
router.delete("/:blog_id", async (req, res) => {
    const { blog_id } = req.params;

    if (!mongoose.isValidObjectId(blog_id))
        return res.status(400).send({ err: "Must be a valid ID" });

    await BlogPost.findByIdAndDelete(blog_id);

    res.send({ message: "OK" });
});

module.exports = router;
