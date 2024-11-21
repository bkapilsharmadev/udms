const { generateFileHash } = require("./app/utils/file-hash");



generateFileHash(__dirname + "/uploads/1e3fdfb7-91a8-4d5f-abd0-2bf7255609b2--Test Module.docx").then((hash) => {
    console.log(hash);
}).catch((err) => {
    console.error(err);
});

