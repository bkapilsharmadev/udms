const { dbError } = require("../utils/error/error");
const documentModel = require("../models/documents.model");
const fileService = require("./files.service");

module.exports.createDocument = async (documentData) => {
	console.log("Create Document>>>> ", documentData);
	const document = await documentModel.createDocument(documentData);
	if (!document?.document_id) {
		throw dbError({ message: "Error creating document", data: result });
	}

	//handle multiple files upload by calling fileService.createFile()
	const { files, created_by } = documentData;
	//insert files into the database
	const filesPromises = [];
	for (const file of files) {
		const fileData = {
			document_id: document.document_id,
			document_uuid: document.document_uuid,
			file_name: file.originalname,
			file_url: file.path,
			file_size: file.size,
			created_by: created_by,
		};

		console.log("File Data>>>> ", fileData);
		filesPromises.push(fileService.createFile(fileData));
	}

	const filesResult = await Promise.allSettled(filesPromises);

	for (const result of filesResult) {
		if (result.status === "rejected") {
			throw dbError({ message: "Error creating file", data: result.reason, moduleName: "documents.service.js" });
		}
	}

	return { message: "Document created successfully" };
};

module.exports.getDocuments = async () => {
	const result = await documentModel.getDocuments();
	return result || [];
};

module.exports.deleteDocument = async (document_id) => {
	const result = await documentModel.deleteDocument(document_id);
	if (!result) {
		throw dbError({ message: "Error deleting document", data: result });
	}
	return { message: "Document deleted successfully" };
};

module.exports.updateDocument = async (document) => {
	const result = await documentModel.updateDocument(document);
	if (!result) {
		throw dbError({ message: "Error updating document", data: result });
	}
	return { message: "Document updated successfully" };
};
