const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");

// Configure storage for Multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/"); // The folder where files will be saved
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = randomUUID();
		const filename = uniqueSuffix + "--" + file.originalname;
		cb(null, filename);
	},
});

const memoryStorage = multer.memoryStorage({})
const excelFileFilter = (req, file, cb) => {
	const allowedMimeTypes = [
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
		'application/vnd.ms-excel', // .xls
		'application/vnd.oasis.opendocument.spreadsheet' // .ods
	];
	const allowedExtensions = ['.xlsx', '.xls', '.ods', '.csv'];

	const fileExtension = path.extname(file.originalname).toLowerCase();
	const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
	const isValidExtension = allowedExtensions.includes(fileExtension);

	if (isValidMimeType && isValidExtension) {
	return cb(null, true);
	} else {
	cb(new Error('Invalid file type. Only Excel files are allowed.'), false); }
}

module.exports.uploadFile = multer({ storage: storage });
module.exports.uploadExcelInMemory = multer({
	storage: memoryStorage, 
	fileFilter: excelFileFilter
}).single('excel');