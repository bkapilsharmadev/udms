const { notFoundError, dbError } = require("../utils/error/error");
const documentStagesService = require("../services/document-stages.service");

module.exports.renderDocumentStages = async (req, res, next) => {
	res.render("document-stages.ejs");
};

module.exports.createDocumentStage = async (req, res, next) => {
	const { document_stage, description, created_by } = req.body;
	const result = await documentStagesService.createDocumentStage({
		document_stage,
		description,
		created_by,
	});

	res.status(201).json(result);
};

module.exports.getDocumentStages = async (req, res, next) => {
	const result = await documentStagesService.getDocumentStages();
	res.status(200).json(result);
};

module.exports.deleteDocumentStage = async (req, res, next) => {
	const { documentStage } = req.body;
	const result = await documentStagesService.deleteDocumentStage(documentStage);

	res.status(200).json(result);
};
