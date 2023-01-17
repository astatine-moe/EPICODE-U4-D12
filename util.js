const fs = require("fs"),
    path = require("path");

const walk = async function* (dir) {
    //walk a directory to get all child folders
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
};

module.exports = {
    walk,
    validateEmail: function (email) {
        var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email);
    },
};
