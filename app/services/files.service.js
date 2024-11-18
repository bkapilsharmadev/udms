const fileModel = require("../models/files.model");
const fileVersioModel = require("../models/file-versions.model");

module.exports.createFile = async (fileData) => {
	const file = await fileModel.createFile(fileData);
	if (!file?.file_id) {
		throw new Error("Error creating file");
	}

	//insert into file_versions
	const fileVersionData = {
		file_id: file.file_id,
		file_name: fileData.file_name,
		document_id: fileData.document_id,
		document_uuid: fileData.document_uuid,
		hash: "DEMO HASH",
		file_url: fileData.file_url,
		created_by: fileData.created_by,
	};

	console.log("File Version Data>>>> ", fileVersionData);
	const fileVersion = await fileVersioModel.createFileVersion(fileVersionData);
	console.log("File Version>>>> ", fileVersion);

	//update latest_version_id in files
	const updatedFile = await this.updateFile({
		file_id: fileVersion.file_id,
		latest_version_id: fileVersion.version_id,
		updated_by: fileData.created_by,
	});

	console.log("Updated File>>>> ", updatedFile);

	return {
		message: "File created successfully",
		file: file,
		fileVersion: fileVersion,
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
