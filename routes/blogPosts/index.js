const express = require("express"),
    mongoose = require("mongoose"),
    router = express.Router();

const { BlogPost, Comment } = require("../../database").schemas;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

router.get("/", async (req, res) => {
    let page = req.query.pageNumber || 1;
    let perPage = clamp(req.query.pageSize || 10, 1, 50);
    page = Math.max(0, page - 1);

    const count = await BlogPost.countDocuments({});

    let posts = await BlogPost.find({})
        .populate("author")
        .limit(perPage)
        .skip(perPage * page)
        .sort({
            createdAt: -1,
        })
        .exec();
    for (let i = 0; i < posts.length; i++) {
        posts[i] = posts[i].toObject();
        posts[i].comments = await Comment.find({
            blog: posts[i]._id,
        });
    }
    for (let post of posts) {
    }

    res.send({
        posts,
        page: page + 1,
        pages: Math.ceil(count / perPage),
        count,
    });
});
router.get("/:blog_id", async (req, res) => {
    const { blog_id } = req.params;

    if (!mongoose.isValidObjectId(blog_id))
        return res.status(400).send({ err: "Must be a valid ID" });

    const post = await BlogPost.findById(req.params.blog_id).populate("author");

    if (!post) return res.status(404).send({ err: "Blog post does not exist" });

    res.send(post);
});
router.post("/:blog_id/like", async (req, res) => {
    const { blog_id } = req.params;

    if (!mongoose.isValidObjectId(blog_id))
        return res.status(400).send({ err: "Must be a valid blog ID" });
    const { author_id } = req.body;
    if (!author_id)
        return res.status(400).send({ err: "Must include author_id" });
    if (!mongoose.isValidObjectId(author_id))
        return res.status(400).send({ err: "Must be a valid author ID" });

    await BlogPost.findByIdAndUpdate(blog_id, {
        $addToSet: { user: author_id },
    });

    res.send({
        message: "OK",
    });
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

// COMMENTS
router.get("/:blog_id/comments", async (req, res) => {
    const { blog_id } = req.params;

    if (!mongoose.isValidObjectId(blog_id))
        return res.status(400).send({ err: "Must be a valid ID" });

    const comments = await Comment.find({});

    res.send(comments);
});

router.get("/:blog_id/comments/:comment_id", async (req, res) => {
    const { blog_id, comment_id } = req.params;

    if (!mongoose.isValidObjectId(blog_id))
        return res.status(400).send({ err: "Must be a valid blog post ID" });
    if (!mongoose.isValidObjectId(comment_id))
        return res.status(400).send({ err: "Must be a valid comment ID" });

    const comment = await Comment.findById(comment_id);

    if (!comment) return res.status(404).send({ err: "No comment found" });

    res.send(comment);
});

router.post("/:blog_id/comments", async (req, res) => {
    const { blog_id } = req.params;

    if (!mongoose.isValidObjectId(blog_id))
        return res.status(400).send({ err: "Must be a valid ID" });

    const { text, author_id } = req.body;

    if (!text || !author_id)
        return res.status(400).send({ err: "Missing required fields" });

    if (!mongoose.isValidObjectId(author_id))
        return res.status(400).send({ err: "Must be a valid author ID" });

    const newComment = new Comment({
        text,
        author: author_id,
        blog: blog_id,
    });

    newComment.save((err, doc) => {
        if (err)
            return res.status(500).send({
                err: "Database error",
            });

        res.send(doc);
    });
});

router.delete("/:blog_id/comments/:comment_id", async (req, res) => {
    const { blog_id, comment_id } = req.params;

    if (!mongoose.isValidObjectId(blog_id))
        return res.status(400).send({ err: "Must be a valid blog post ID" });
    if (!mongoose.isValidObjectId(comment_id))
        return res.status(400).send({ err: "Must be a valid comment ID" });

    await Comment.findByIdAndDelete(comment_id);

    res.send({
        message: "OK",
    });
});

module.exports = router;
