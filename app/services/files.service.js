const fileModel = require("../models/files.model");
const fileVersioModel = require("../models/file-versions.model");

module.exports.createFile = async (file) => {
	const file = await fileModel.createFile(file);
	if (!file?.file_id) {
		throw new Error("Error creating file");
	}


	return { 
        message: "File created successfully",
        file: result
    };
};

module.exports.getFiles = async () => {
	const result = await fileModel.getFiles();
	return result || [];
};

module.exports.deleteFile = async (file_id) => {
	const result = await fileModel.deleteFile(file_id);
	if (!result) {
		throw new Error("Error deleting file");
	}
	return { message: "File deleted successfully" };
};

module.exports.updateFile = async (file) => {
	const result = await fileModel.updateFile(file);
	if (!result) {
		throw new Error("Error updating file");
	}
	return { message: "File updated successfully" };
};
