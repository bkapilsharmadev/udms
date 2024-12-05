const documentReviewModel = require("../models/document-reviews.model");
const documentReviewFilesService = require("./document-review-files.service");
const documentService = require("./documents.service");
const { dbError } = require("../utils/error/error");

module.exports.createDocumentReview = async (data, dbTransaction) => {
	// Call the model to insert the document review
	const documentReview = await documentReviewModel.createDocumentReview(
		data,
		dbTransaction
	);
	if (!documentReview?.review_id) {
		throw dbError({
			message: "Error creating document review",
			moduleName: "document-reviews.service.js",
		});
	}

	//create document review files
	const { review_id, document_id } = documentReview;

	const documentReviewFiles =
		await documentReviewFilesService.createDocumentReviewFiles(
			{ review_id, files: data.files, session_user: data.session_user },
			dbTransaction
		);

	if (!documentReviewFiles.success) {
		throw dbError({
			message: "Error creating document review files",
			moduleName: "document-reviews.service.js",
		});
	}

	return {
		success: true,
		data: documentReview,
		message: "Document review created successfully",
	};
};

module.exports.getDocumentReviewById = async (review_id, dbTransaction) => {
	const result = await documentReviewModel.getDocumentReviewById(review_id);
	return result || {};
};

module.exports.getLatestReviewByDocumentId = async (
	document_id,
	dbTransaction
) => {
	const result = await documentReviewModel.getLatestReviewByDocumentId(
		document_id
	);
	return result || {};
};

module.exports.getReviewsByDocId = async (document_id, dbTransaction) => {
	const result = await documentReviewModel.getReviewsByDocId(document_id, dbTransaction);
	return result || [];
};

module.exports.updateDocumentReview = async (reviewData, dbTransaction) => {
	const { is_final_approval, status, files } = reviewData;

	const review = await documentReviewModel.updateDocumentReview(
		reviewData,
		dbTransaction
	);
	if (!review?.review_id) {
		throw dbError({
			message: "Error updating document review",
			moduleName: "document-reviews.service.js",
		});
	}

	console.log(">>>>> REVIEW UPDATED", review);

	const updatedDocument = await documentService.updateIsFinalApproval(
		{
			document_id: review.document_id,
			is_final_approval,
			session_username: reviewData.session_user,
		},
		dbTransaction
	);

	console.log(">>>>> UPDATED DOCUMENT", updatedDocument);

	if (is_final_approval || status === "REJECTED") {
		await documentService.updateDocumentStatus(
			{
				document_id: review.document_id,
				status,
				session_username: reviewData.session_user,
			},
			dbTransaction
		);
	}

	if (
		!is_final_approval &&
		(status === "APPROVED" ||
			status === "SENT FOR REVISION" ||
			status === "REVISED")
	) {
		//add new document review for the next stage
		console.log(">>>>> FORWARDING THE DOCUMENT");

		let uniqueFileIds;

		if (files?.length > 0) {
			uniqueFileIds = files;
		} else {
			let reviewFiles =
				await documentReviewFilesService.getDocumentReviewFilesByReviewId(
					review?.review_id,
					dbTransaction
				);

			uniqueFileIds = [...new Set(reviewFiles.map((item) => item.file_ids))];
		}

		const { forwarded_to, session_user } = reviewData;

		const nextDocumentReviewData = {
			document_id: review.document_id,
			document_uuid: review.document_uuid,
			files: uniqueFileIds,
			to_be_reviewed_by: forwarded_to,
			reviewed_by: null,
			reviewed_at: null,
			document_stage: "FORWARDED",
			forwarded_to: null,
			status: "PENDING",
			comments: null,
			session_user: session_user,
			created_status: review.status,
		};

		const nextDocumentReview = await this.createDocumentReview(
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

	return {
		message: "Document review updated successfully",
	};
};

module.exports.deleteDocumentReview = async (review_id, dbTransaction) => {
	const result = await documentReviewModel.deleteDocumentReview(review_id);
	return result;
};

module.exports.softDeleteByDocumentId = async (document_id, dbTransaction) => {
	const result = await documentReviewModel.softDeleteByDocumentId(
		document_id,
		dbTransaction
	);
	return result;
};

module.exports.isDocReviewable = async (data, dbTransaction) => {
	const editableDetails = await documentService.docEditableDetails(
		data,
		dbTransaction
	);

	if (
		editableDetails.to_be_reviewed_by === data.session_user &&
		editableDetails.status === "PENDING" &&
		editableDetails.reviewed_by === null &&
		editableDetails.document_owner !== editableDetails.to_be_reviewed_by
	) {
		return true;
	}

	return false;
};
