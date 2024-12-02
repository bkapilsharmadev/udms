const fileVersionModel = require("../models/file-versions.model");
const {
	dbError,
	notFoundError,
	internalServerError,
} = require("../utils/error/error");
const path = require("path");
const fs = require("fs");

module.exports.createFileVersion = async (fileVersion) => {
	const result = await fileVersionModel.createFileVersion(fileVersion);
	if (!result) {
		throw new Error("Error creating file version");
	}
	return { message: "File version created successfully" };
};

module.exports.getFileVersions = async () => {
	const result = await fileVersionModel.getFileVersions();
	return result || [];
};

module.exports.deleteFileVersion = async (version_id) => {
	const result = await fileVersionModel.deleteFileVersion(version_id);
	if (!result) {
		throw new Error("Error deleting file version");
	}
	return { message: "File version deleted successfully" };
};

module.exports.updateFileVersion = async (fileVersion) => {
	const result = await fileVersionModel.updateFileVersion(fileVersion);
	if (!result) {
		throw new Error("Error updating file version");
	}
	return { message: "File version updated successfully" };
};

module.exports.getFileVersionsByDocumentId = async (document_id) => {
	const result = await fileVersionModel.getFileVersionsByDocumentId(
		document_id
	);
	return result || [];
};

module.exports.downloadFile = async (version_id) => {
	const result = await fileVersionModel.getFileByVersionId(version_id);
	if (result.length == 0) {
		throw dbError({
			moduleName: "file-versions.service.js",
			message: "Error In Fetching File",
			data: result,
		});
	}

	const uploadDir = process.env.UPLOAD_DIR;
	const fileName = path.basename(result[0].file_url);
	const originalFileName = fileName.split("--")[1];
	console.log("filename>>>> ", fileName);
	console.log("uploadsDir>>>> ", uploadDir);

	const filePath = path.join(uploadDir, fileName);

	if (!fs.existsSync(filePath)) {
		throw notFoundError({
			moduleName: "file-versions.service.js",
			message: "File Not Found",
		});
	}

	return { originalFileName, fileName, filePath };
};

module.exports.softDelByDocumentId = async (data, dbTransaction) => {
	const result = await fileVersionModel.softDelByDocumentId(data, dbTransaction);
	if (!result) {
		throw new Error("Error deleting file version");
	}
	return { success: true, message: "File version deleted successfully" };
};
