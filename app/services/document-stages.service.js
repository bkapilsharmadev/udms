const { invalidRequestError, dbError } = require("../utils/error/error");
const documentStagesModel = require("../models/document-stages.model");

module.exports.createDocumentStage = async (documentStage) => {
	const result = await documentStagesModel.createDocumentStage(documentStage);

	if (!result) {
		throw dbError({
			moduleName: "document-stages.service.js",
			message: "Error creating document stage",
			data: result,
		});
	}

	return { message: "Document stage created successfully" };
};

module.exports.getDocumentStages = async () => {
	const result = await documentStagesModel.getDocumentStages();
	return result || [];
};

module.exports.deleteDocumentStage = async (documentStage) => {
	const result = await documentStagesModel.deleteDocumentStage(documentStage);

	if (!result) {
		throw dbError({
			moduleName: "document-stages.service.js",
			message: "Error deleting document stage",
			data: result,
		});
	}

	return { message: "Document stage deleted successfully" };
};
