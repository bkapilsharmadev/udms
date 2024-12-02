const documentReviewFilesModel = require("../models/document-review-files.model");

module.exports.createDocumentReviewFiles = async (
	documentReviewFilesData,
	dbTransaction
) => {
	const documentReviewFile =
		await documentReviewFilesModel.createDocumentReviewFiles(
			documentReviewFilesData,
			dbTransaction
		);

	if (!documentReviewFile) {
		throw new Error("Error creating document review files");
	}

	return {
		success: documentReviewFile,
		message: "Document review files created successfully",
	};
};

module.exports.getDocumentReviewFilesByReviewId = async (
	review_id,
	dbTransaction
) => {
	const result =
		await documentReviewFilesModel.getDocumentReviewFilesByReviewId(
			review_id,
			dbTransaction
		);
	return result || [];
};
