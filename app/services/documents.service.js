const { dbError } = require("../utils/error/error");
const documentModel = require("../models/documents.model");
const fileService = require("./files.service");
const documentReviewService = require("./document-reviews.service");

module.exports.createDocument = async (documentData, dbTransaction) => {
	console.log("Create Document>>>> ", documentData);
	console.log("Transaction object>>>> ", dbTransaction);

	const document = await documentModel.createDocument(
		documentData,
		dbTransaction
	);
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
		filesPromises.push(fileService.createFile(fileData, dbTransaction));
	}

	const filesResult = await Promise.allSettled(filesPromises);
	const fileIds = [];

	console.log("Files Result>>>> ", filesResult);

	for (const result of filesResult) {
		if (result.status === "rejected") {
			throw dbError({
				message: "Error creating file",
				data: result.reason,
				moduleName: "documents.service.js",
			});
		}

		fileIds.push(result?.value?.file_id?.file_id || null);
	}

	//insert into document_reviews table
	const documentReviewData = {
		document_id: document.document_id,
		document_uuid: document.document_uuid,
		to_be_reviewed_by: created_by,
		reviewed_by: created_by,
		reviewed_at: new Date(),
		document_stage: "CREATED",
		forwarded_to: documentData.forwarded_to,
		status: "APPROVED",
		comments: documentData.comments,
		created_by: created_by,
	};

	console.log("Document Review Data>>>> ", documentReviewData);
	const documentReview = await documentReviewService.createDocumentReview(
		documentReviewData,
		dbTransaction
	);

	if (documentReviewData.status === "APPROVED") {
		//add new document review for the next stage
		const nextDocumentReviewData = {
			document_id: document.document_id,
			document_uuid: document.document_uuid,
			to_be_reviewed_by: documentData.forwarded_to,
			reviewed_by: null,
			reviewed_at: null,
			document_stage: "FORWARDED",
			forwarded_to: null,
			status: "PENDING",
			comments: null,
			created_by: created_by,
		};

		console.log("Next Document Review Data>>>> ", nextDocumentReviewData);

		const nextDocumentReview = await documentReviewService.createDocumentReview(
			nextDocumentReviewData,
			dbTransaction
		);

		if (!nextDocumentReview?.review_id) {
			throw dbError({
				message: "Error creating next document review",
				data: nextDocumentReview,
				moduleName: "documents.service.js",
			});
		}
	}

	return { message: "Document created successfully" };
};

module.exports.getDocuments = async (sessionUsername) => {
	const result = await documentModel.getDocuments(sessionUsername);
	return result || [];
};

module.exports.getMyDocuments = async (sessionUsername) => {
	const result = await documentModel.getMyDocuments(sessionUsername);
	return result || [];
};

module.exports.getReceivedDocuments = async (sessionUsername) => {
	const result = await documentModel.getReceivedDocuments(sessionUsername);
	return result || [];
};

module.exports.getDocumentById = async (document_id) => {
	const result = await documentModel.getDocumentById(document_id);
	return result || {};
};

module.exports.deleteDocument = async (document_id) => {
	const result = await documentModel.deleteDocument(document_id);
	if (!result) {
		throw dbError({ message: "Error deleting document", data: result });
	}
	return { message: "Document deleted successfully" };
};

module.exports.updateDocument = async (document) => {
	//check if the document has been reviewed by any other user apart from the creator
	// const isDocumentReviewed = await documentReviewService.checkIsDocumentReviewed(documentId);
	// if (isDocumentReviewed) {
	// 	throw dbError({
	// 		message: "Document has been reviewed by another user",
	// 		data: isDocumentReviewed,
	// 	});

	const result = await documentModel.updateDocument(document);
	if (!result) {
		throw dbError({ message: "Error updating document", data: result });
	}

	//for now new file will be created in the file table

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
		filesPromises.push(fileService.createFile(fileData, dbTransaction));
	}

	const filesResult = await Promise.allSettled(filesPromises);

	for (const result of filesResult) {
		if (result.status === "rejected") {
			throw dbError({
				message: "Error creating file",
				data: result.reason,
				moduleName: "documents.service.js",
			});
		}
	}

	return { message: "Document updated successfully" };
};

module.exports.updateIsFinalApproval = async (document) => {
	const result = await documentModel.updateIsFinalApproval(document);
	if (!result) {
		throw dbError({ message: "Error updating document", data: result });
	}
	return { message: "Document updated successfully" };
};

module.exports.updateDocumentStatus = async (document) => {
	const result = await documentModel.updateDocumentStatus(document);
	if (!result) {
		throw dbError({ message: "Error updating document", data: result });
	}
	return { message: "Document updated successfully" };
};
