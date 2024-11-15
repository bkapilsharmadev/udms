const multer = require("multer");
const { randomUUID } = require("crypto");

// Configure storage for Multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/"); // The folder where files will be saved
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = randomUUID();
		const filename = uniqueSuffix + "-" + file.originalname;
		cb(null, filename);
	},
});

module.exports.uploadFile = multer({ storage: storage });
