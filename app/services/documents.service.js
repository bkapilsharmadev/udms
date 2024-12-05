const { dbError } = require("../utils/error/error");
const documentModel = require("../models/documents.model");
const fileService = require("./files.service");
const documentReviewService = require("./document-reviews.service");

module.exports.createDocument = async (documentData, dbTransaction) => {
	const document = await documentModel.createDocument(
		documentData,
		dbTransaction
	);
	if (!document?.document_id) {
		throw dbError({ message: "Error creating document", data: result });
	}

	//handle multiple files upload by calling fileService.createFile()
	const { files, session_user } = documentData;
	//insert files into the database
	const filesPromises = [];
	for (const file of files) {
		const fileData = {
			document_id: document.document_id,
			document_uuid: document.document_uuid,
			file_name: file.originalname,
			file_url: file.path,
			file_size: file.size,
			session_user: session_user,
		};

		filesPromises.push(fileService.createFile(fileData, dbTransaction));
	}

	const filesResult = await Promise.allSettled(filesPromises);
	const documentReviewFiles = [];

	for (const result of filesResult) {
		if (result.status === "rejected") {
			throw dbError({
				message: "Error creating file",
				data: result.reason,
				moduleName: "documents.service.js",
			});
		}

		documentReviewFiles.push(result?.value?.file?.file_id);
	}

	console.log("Document Review Files>>>> ", documentReviewFiles);
	//insert into document_reviews table
	const documentReviewData = {
		document_id: document.document_id,
		document_uuid: document.document_uuid,
		files: documentReviewFiles,
		to_be_reviewed_by: session_user,
		reviewed_by: session_user,
		reviewed_at: new Date(),
		document_stage: "CREATED",
		forwarded_to: documentData.forwarded_to,
		status: "APPROVED",
		created_status: "APPROVED",
		comments: documentData.comments,
		session_user: session_user,
	};

	const documentReview = await documentReviewService.createDocumentReview(
		documentReviewData,
		dbTransaction
	);

	if (!documentReview?.success) {
		throw dbError({
			message: "Error creating document review",
			data: documentReview,
			moduleName: "documents.service.js",
		});
	}

	if (documentReviewData.status === "APPROVED") {
		//add new document review for the next stage
		const nextDocumentReviewData = {
			document_id: document.document_id,
			document_uuid: document.document_uuid,
			files: documentReviewFiles,
			to_be_reviewed_by: documentData.forwarded_to,
			reviewed_by: null,
			reviewed_at: null,
			document_stage: "FORWARDED",
			forwarded_to: null,
			status: "PENDING",
			created_status: "APPROVED",
			comments: null,
			session_user: session_user,
		};

		const nextDocumentReview = await documentReviewService.createDocumentReview(
			nextDocumentReviewData,
			dbTransaction
		);

		if (!nextDocumentReview?.success) {
			throw dbError({
				message: "Error creating next document review",
				data: nextDocumentReview,
				moduleName: "documents.service.js",
			});
		}
	}

	return { message: "Document created successfully" };
};

module.exports.getDocuments = async (payload, dbTransaction) => {
	let {
		pageNo,
		pageSize,
		cursor,
		isOr,
		filterCriteria = [],
		orderCriteria = [],
		searchCriteria = {},
		findById = false,
		session_user,
	} = payload;

	//find the obj with logicalName: "createdBy"
	let createdBy = filterCriteria?.filter((item) => {
		if (item.logicalName === "createdBy") {
			return item.value;
		}
	})[0]?.value;

	//remove the obj with logicalName: "createdBy"
	filterCriteria = filterCriteria.filter(
		(item) => item.logicalName !== "createdBy"
	);

	//if createdBy is not null, then add the createdBy filter
	if (createdBy && createdBy === "SELF") {
		filterCriteria.push({
			logicalName: "createdBy",
			operator: "=",
			value: session_user,
		});
	} else if (createdBy && createdBy === "OTHERS") {
		filterCriteria.push({
			logicalName: "createdBy",
			operator: "<>",
			value: session_user,
		});
	}

	let sqlOptions = {
		pageNo,
		pageSize,
		cursor,
		isOr,
		filterCriteria,
		orderCriteria,
		searchCriteria,
		session_user,
	};

	const result = await documentModel.getDocuments(sqlOptions, dbTransaction);
	return result || [];
};

module.exports.getDocumentsCount = async (payload, dbTransaction) => {
	let { isOr, filterCriteria, searchCriteria, session_user } = payload;

	//find the obj with logicalName: "createdBy"
	let createdBy = filterCriteria?.filter((item) => {
		if (item.logicalName === "createdBy") {
			return item.value;
		}
	})[0]?.value;

	//remove the obj with logicalName: "createdBy"
	filterCriteria = filterCriteria.filter(
		(item) => item.logicalName !== "createdBy"
	);

	//if createdBy is not null, then add the createdBy filter
	if (createdBy && createdBy === "SELF") {
		filterCriteria.push({
			logicalName: "createdBy",
			operator: "=",
			value: session_user,
		});
	} else if (createdBy && createdBy === "OTHERS") {
		filterCriteria.push({
			logicalName: "createdBy",
			operator: "<>",
			value: session_user,
		});
	}

	let sqlOptions = { isOr, filterCriteria, searchCriteria, session_user };

	let totalDocCount = await documentModel.getDocumentsCount(
		sqlOptions,
		dbTransaction
	);
	// console.log("totalDocCount>>>> ", totalDocCount);
	return totalDocCount;
};

module.exports.getMyDocuments = async (sessionUsername, dbTransaction) => {
	const result = await documentModel.getMyDocuments(sessionUsername);
	return result || [];
};

module.exports.getReceivedDocuments = async (
	sessionUsername,
	dbTransaction
) => {
	const result = await documentModel.getReceivedDocuments(sessionUsername);
	return result || [];
};

module.exports.getDocumentById = async (document_id, dbTransaction) => {
	const result = await documentModel.getDocumentById(document_id);
	return result || {};
};

module.exports.deleteDocument = async (document_id, dbTransaction) => {
	const result = await documentModel.deleteDocument(document_id);
	if (!result) {
		throw dbError({ message: "Error deleting document", data: result });
	}
	return { message: "Document deleted successfully" };
};

module.exports.updateDocument = async (documentData, dbTransaction) => {
	console.log("documentData>>>> ", documentData);
	const docEditableDetails = await documentModel.docEditableDetails(
		{
			document_id: documentData.document_id,
			session_user: documentData.session_user,
		},
		dbTransaction
	);

	console.log("Doc Editable Details>>>> ", docEditableDetails);

	if (!docEditableDetails.is_editable) {
		throw dbError({
			message: "Document is not editable",
			moduleName: "documents.service.js",
		});
	}

	const isReviewedByOther = docEditableDetails?.count > 2 ? true : false;

	const document = await documentModel.updateDocument(
		documentData,
		dbTransaction
	);

	if (!document?.document_id) {
		throw dbError({ message: "Error updating document", data: result });
	}

	//soft delete the previous files
	await fileService.softDelByDocumentId(
		{
			document_id: documentData.document_id,
			session_user: documentData.session_user,
		},
		dbTransaction
	);

	//insert files into the database
	const { files, session_user } = documentData;
	const filesPromises = [];
	for (const file of files) {
		const fileData = {
			document_id: document.document_id,
			document_uuid: document.document_uuid,
			file_name: file.originalname,
			file_url: file.path,
			file_size: file.size,
			session_user: session_user,
		};

		filesPromises.push(fileService.createFile(fileData, dbTransaction));
	}

	const filesResult = await Promise.allSettled(filesPromises);
	const documentReviewFiles = [];

	for (const result of filesResult) {
		if (result.status === "rejected") {
			throw dbError({
				message: "Error creating file",
				data: result.reason,
				moduleName: "documents.service.js",
			});
		}

		documentReviewFiles.push(result?.value?.file?.file_id);
	}

	//if isReviewedByOther != true, then soft delete the previous review
	if (!isReviewedByOther) {
		const isDeleted = await documentReviewService.softDeleteByDocumentId(
			document.document_id,
			dbTransaction
		);

		//insert into document_reviews table
		const documentReviewData = {
			document_id: document.document_id,
			document_uuid: document.document_uuid,
			files: documentReviewFiles,
			to_be_reviewed_by: session_user,
			reviewed_by: session_user,
			reviewed_at: new Date(),
			document_stage: "CREATED",
			forwarded_to: documentData.forwarded_to,
			status: "APPROVED",
			created_status: "APPROVED",
			comments: documentData.comments,
			session_user: session_user,
		};

		console.log("Document Review Data>>>> ", documentReviewData);
		const documentReview = await documentReviewService.createDocumentReview(
			documentReviewData,
			dbTransaction
		);

		//add new document review for the next stage
		const nextDocumentReviewData = {
			document_id: document.document_id,
			document_uuid: document.document_uuid,
			files: documentReviewFiles,
			to_be_reviewed_by: documentData.forwarded_to,
			reviewed_by: null,
			reviewed_at: null,
			document_stage: "FORWARDED",
			forwarded_to: null,
			status: "PENDING",
			created_status: "APPROVED",
			comments: null,
			session_user: session_user,
		};

		const nextDocumentReview = await documentReviewService.createDocumentReview(
			nextDocumentReviewData,
			dbTransaction
		);
	} else {
		// update the existing document review with status "REVISED"

		const updateReviewData = {
			review_id: docEditableDetails.review_id,
			files: documentReviewFiles,
			status: "REVISED",
			comments: documentData.comments,
			is_final_approval: false,
			forwarded_to: documentData.forwarded_to,
			reviewed_at: new Date(),
			session_user: session_user,
		};

		console.log("Update Review Data>>>> ", updateReviewData);

		await documentReviewService.updateDocumentReview(
			updateReviewData,
			dbTransaction
		);

		//insert into document_reviews table
	}
	return { message: "Document updated successfully" };
};

module.exports.updateIsFinalApproval = async (document, dbTransaction) => {
	const result = await documentModel.updateIsFinalApproval(
		document,
		dbTransaction
	);
	if (!result) {
		throw dbError({ message: "Error updating document", data: result });
	}
	return { message: "Document updated successfully" };
};

module.exports.updateDocumentStatus = async (document, dbTransaction) => {
	const result = await documentModel.updateDocumentStatus(
		document,
		dbTransaction
	);
	if (!result) {
		throw dbError({ message: "Error updating document", data: result });
	}
	return { message: "Document updated successfully" };
};

module.exports.docEditableDetails = async (data, dbTransaction) => {
	const isEditableData = await documentModel.docEditableDetails(
		data,
		dbTransaction
	);
	return isEditableData;
};
