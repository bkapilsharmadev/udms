const { dbError } = require("../utils/error/error");
const documentService = require("../services/documents.service");
const { uploadFile } = require("../middleware/file-upload.middleware");
const { getEntities } = require("../services/entities.service");
const { MENTOR_SIGNS } = require("../constants");
const { getStatusTypes } = require("../services/status-types.service");
const { getDocumentStages } = require("../services/document-stages.service");
const { getFileVersionsByDocumentId } = require("../services/file-versions.service");
const { getLatestReviewByDocumentId } = require("../services/document-reviews.service")
const { getDocumentCategories } = require("../services/document-categories.service");

module.exports.renderDocuments = async (req, res, next) => {
	// fetch all entities, MENTOR_SIGNS constants and render the documents view
	const result = await Promise.all([getEntities(), getStatusTypes(),getDocumentCategories()]);

	const data = {
		entities: result[0],
		statusTypes: result[1],
		mentorSigns: MENTOR_SIGNS,
		documentCategories : result[2]
	};

	res.render("documents/documents.ejs", { data });
};

module.exports.renderMyDocumentList = async (req, res, next) => {
	const result = await documentService.getMyDocuments(req.session_username);
	res.render("documents/my-document-list.ejs", { documents: result });
};

module.exports.renderReceivedDocumentList = async (req, res, next) => {
	const result = await documentService.getReceivedDocuments(
		req.session_username
	);
	res.render("documents/received-document-list.ejs", { documents: result });
};

module.exports.createDocument = async (req, res, next) => {
	uploadFile.array("files", 10)(req, res, async (err) => {
		if (err) {
			// Pass the error to the next middleware (error handler)
			return next(err);
		}

		try {
			// If no error, continue with your logic
			const {
				category_id,
				ref_no,
				description,
				received_from,
				university_entt_id,
				campus_entt_id,
				school_entt_id,
				department_entt_id,
				mentor_sign,
				status,
				comments,
				forwarded_to,
			} = req.body;

			// Get the files from req.files after Multer processes them
			const files = req.files;

			// Call the service to create the document and handle the files
			const result = await documentService.createDocument({
				category_id,
				ref_no,
				description,
				received_from,
				university_entt_id,
				campus_entt_id,
				school_entt_id,
				department_entt_id,
				mentor_sign,
				status,
				comments,
				forwarded_to,
				files,
				created_by: req.session_username,
			});

			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	});
};

module.exports.renderSingleDocument = async (req, res, next) => {
	const { document_id } = req.params;
	const result = await Promise.all([
		getStatusTypes(),
		documentService.getDocumentById(document_id),
		getDocumentStages(),
		getFileVersionsByDocumentId(document_id),
		getLatestReviewByDocumentId(document_id)
	]);

	const data = {
		statusTypes: result[0],
		document: result[1],
		documentStages: result[2],
		fileVersions: result[3],
		documentReviews: result[4]
	};

	res.render("documents/single-document.ejs", { data });
};

module.exports.getDocuments = async (req, res, next) => {
	const result = await documentService.getDocuments();
	res.status(200).json(result);
};

module.exports.deleteDocument = async (req, res, next) => {
	const { document_id } = req.body;
	const result = await documentService.deleteDocument(document_id);
	res.status(200).json(result);
};

module.exports.updateDocument = async (req, res, next) => {
	const { document_id, ref_no, description } = req.body;
	const result = await documentService.updateDocument({
		document_id,
		ref_no,
		description,
		updated_by: req.session_username,
	});
	res.status(200).json(result);
};

module.exports.updateIsFinalApproval = async (req, res, next) => {
	const { document_id, is_final_approval } = req.body;
	const result = await documentService.updateIsFinalApproval({
		document_id,
		is_final_approval,
		session_username: req.session_username,
	});
	res.status(200).json(result);
};
