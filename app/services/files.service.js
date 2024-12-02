const fileModel = require("../models/files.model");
const fileVersioModel = require("../models/file-versions.model");

module.exports.createFile = async (fileData, dbTransaction) => {
	const file = await fileModel.createFile(fileData, dbTransaction);
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
		session_user: fileData.session_user,
	};

	console.log("File Version Data>>>> ", fileVersionData);
	const fileVersion = await fileVersioModel.createFileVersion(
		fileVersionData,
		dbTransaction
	);
	console.log("File Version>>>> ", fileVersion);

	//update latest_version_id in files
	const updatedFile = await this.updateFile(
		{
			file_id: fileVersion.file_id,
			latest_version_id: fileVersion.version_id,
			session_user: fileData.session_user,
		},
		dbTransaction
	);

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

module.exports.deleteFile = async (file_id, dbTransaction) => {
	const result = await fileModel.deleteFile(file_id);
	if (!result) {
		throw new Error("Error deleting file");
	}
	return { message: "File deleted successfully" };
};

module.exports.updateFile = async (file, dbTransaction) => {
	const result = await fileModel.updateFile(file, dbTransaction);
	if (!result) {
		throw new Error("Error updating file");
	}
	return { message: "File updated successfully" };
};

module.exports.softDelByDocumentId = async (data, dbTransaction) => {
	const fileDeleted = await fileModel.softDelByDocumentId(data, dbTransaction);
	if (!fileDeleted) {
		throw new Error("Error deleting file");
	}

	const fileVersionsDeleted = await fileVersioModel.softDelByDocumentId(
		data,
		dbTransaction
	);

	if (!fileVersionsDeleted) {
		throw new Error("Error deleting file versions");
	}

	return { success: true, message: "File deleted successfully" };
};
