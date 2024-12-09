const { dbError } = require("../utils/error/error");
const documentService = require("../services/documents.service");
const { uploadFile } = require("../middleware/file-upload.middleware");
const { getEntities } = require("../services/entities.service");
const { MENTOR_SIGNS } = require("../constants");
const { getStatusTypes } = require("../services/status-types.service");
const { getDocumentStages } = require("../services/document-stages.service");

const {
	getFileVersionsByDocumentId,
} = require("../services/file-versions.service");
const {
	getLatestReviewByDocumentId,
	getReviewsByDocId,
} = require("../services/document-reviews.service");
const {
	getDocumentCategories,
} = require("../services/document-categories.service");
const { isDocReviewable } = require("../services/document-reviews.service");
const {
	getDocumentStageUsersExcludingUser,
} = require("../services/document-stage-users.service");
const { isDocEditable } = require("../models/documents.model");

module.exports.renderDocuments = async (req, res, next) => {
	// fetch all entities, MENTOR_SIGNS constants and render the documents view
	const username = req.session_username;
	const result = await Promise.all([
		getEntities(),
		getStatusTypes(),
		getDocumentCategories(),
		getDocumentStageUsersExcludingUser(username),
	]);

	const data = {
		entities: result[0],
		statusTypes: result[1],
		mentorSigns: MENTOR_SIGNS,
		documentCategories: result[2],
		documentStageUsers: result[3],
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
			const result = await documentService.createDocument(
				{
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
					session_user: req.session_username,
				},
				req.dbTransaction
			);

			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	});
};

module.exports.renderSingleDocument = async (req, res, next) => {
	const { document_id } = req.params;
	const username = req.session_username;
	const result = await Promise.all([
		getStatusTypes(req.pgTransaction),
		documentService.getDocumentById(document_id, req.pgTransaction),
		getDocumentStageUsersExcludingUser(username, req.pgTransaction),
		getFileVersionsByDocumentId(document_id, req.pgTransaction),
		getLatestReviewByDocumentId(document_id, req.pgTransaction),
		isDocReviewable({ document_id, session_user: username }, req.pgTransaction),
		getReviewsByDocId(document_id, req.pgTransaction),
	]);

	const data = {
		statusTypes: result[0],
		document: result[1],
		documentStageUsers: result[2],
		fileVersions: result[3],
		documentReviews: result[4],
		isDocReviewable: result[5],
		reviewHistory: result[6],
	};

	// console.log("Single Document Data >>>> ", data);

	res.render("documents/single-document.ejs", { data });
};

module.exports.renderEditDocument = async (req, res, next) => {
	const { document_id } = req.params;
	const sessionUser = req.session_username;

	const result = await Promise.all([
		getEntities(),
		getStatusTypes(),
		getDocumentCategories(),
		getDocumentStageUsersExcludingUser(sessionUser),
		documentService.docEditableDetails({
			document_id,
			session_user: sessionUser,
		}),
		documentService.getDocumentById(document_id, req.pgTransaction),
	]);

	const data = {
		entities: result[0],
		statusTypes: result[1],
		mentorSigns: MENTOR_SIGNS,
		documentCategories: result[2],
		documentStageUsers: result[3],
		isDocEditable: result[4],
	};

	const document = result[5][0];
	console.log("Document >>>> ", document);

	res.render("documents/edit-document.ejs", { data, document });
};

module.exports.getDocuments = async (req, res, next) => {
	console.log(">>>> GET DOCUMENTS");

	const docList = await documentService.getDocuments(
		{
			...req.body,
			...req.query,
			...req.params,
			session_user: req.session_username,
		},
		req.pgTransaction
	);
	// console.log("docList>>>> ", docList);

	const totalDocCount = await documentService.getDocumentsCount(
		{
			...req.body,
			...req.query,
			...req.params,
			session_user: req.session_username,
		},
		req.pgTransaction
	);

	
	console.log("totalDocCount>>>> ", totalDocCount);


	res.status(200).json({ docList, totalDocCount });
};

module.exports.deleteDocument = async (req, res, next) => {
	const { document_id } = req.body;
	const result = await documentService.deleteDocument(document_id);
	res.status(200).json(result);
};

module.exports.updateDocument = async (req, res, next) => {
	uploadFile.array("files", 10)(req, res, async (err) => {
		if (err) {
			// Pass the error to the next middleware (error handler)
			return next(err);
		}

		try {
			// If no error, continue with your logic
			const {
				document_id,
				category_id,
				is_update,
				description,
				updated_,
			} = req.body;

			// Get the files from req.files after Multer processes them
			const files = req.files;

			// Call the service to create the document and handle the files
			const result = await documentService.updateDocument(
				{
					document_id,
					category_id,
					is_update,
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
					session_user: req.session_username,
				},
				req.dbTransaction
			);

			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	});
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
