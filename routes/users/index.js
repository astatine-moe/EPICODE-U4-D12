const express = require("express"),
    mongoose = require("mongoose"),
    router = express.Router();

const argon2 = require("argon2"); //best password hashing library imo
const jwt = require("jsonwebtoken"); //for generating tokens

const { User } = require("../../database").schemas;

const isAuthenticated = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).send("You are not authenticated");
    }
};

const isNotAuthenticated = (req, res, next) => {
    if (!req.user) {
        next();
    } else {
        res.status(401).send("You are already authenticated");
    }
};

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_TOKEN, {
        expiresIn: "15m",
    });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {
        expiresIn: "7d",
    });
};

const sendRefreshToken = (res, token) => {
    res.cookie("jid", token, {
        httpOnly: true,
        path: "/refresh_token",
    });
};

router.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
        return res.send({ ok: false, accessToken: "" });
    }

    let payload = null;
    try {
        payload = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
    } catch (err) {
        console.error(err);
        return res.send({ ok: false, accessToken: "" });
    }

    // token is valid and we can send back an access token

    res.send({
        ok: true,
        accessToken: generateAccessToken({ userId: payload.userId }),
    });
});

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return next();
    }

    let payload = null;

    try {
        payload = jwt.verify(token, process.env.JWT_TOKEN);
    } catch (err) {
        console.error(err);
        return next();
    }

    req.user = await User.findById(payload.userId, { password: 0 });
    next();
};

router.post("/register", isNotAuthenticated, async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).send("Missing required fields");
    }

    try {
        const hashedPassword = await argon2.hash(password);
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await user.save();
        //log them in
        const accessToken = generateAccessToken({
            userId: user._id,
            role: "User",
        });
        const refreshToken = generateRefreshToken({
            userId: user._id,
            role: "User",
        });
        sendRefreshToken(res, refreshToken);
        res.send({ accessToken });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

router.post("/login", isNotAuthenticated, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Missing required fields");
    }

    //compare hash in database

    try {
        const pHash = argon2.hash(password);

        const user = User.findOne({
            email,
            password: pHash,
        });

        if (!user) {
            return res.status(400).send("Invalid email or password");
        }

        const accessToken = generateAccessToken({
            userId: user._id,
            role: user.role,
        });
        const refreshToken = generateRefreshToken({
            userId: user._id,
            role: user.role,
        });

        sendRefreshToken(res, refreshToken);
        res.send({ accessToken });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

router.post("/logout", isAuthenticated, async (req, res) => {
    res.clearCookie("jid");
    res.send("Logged out");
});

router.get("/me", authMiddleware, async (req, res) => {
    res.send(req.user);
});

module.exports = router;
