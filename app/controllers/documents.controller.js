const { dbError } = require("../utils/error/error");
const documentService = require("../services/documents.service");
const { uploadFile } = require("../middleware/file-upload.middleware");

module.exports.renderDocuments = async (req, res, next) => {
	res.render("documents.ejs");
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
				document_stage,
				status,
				created_by,
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
				document_stage,
				status,
				created_by,
				files,
			});

			res.status(201).json(result);
		} catch (error) {
			// In case of any other error, pass it to the error handler
			next(error);
		}
	});
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
	const { document_id, ref_no, description, updated_by } = req.body;
	const result = await documentService.updateDocument({
		document_id,
		ref_no,
		description,
		updated_by,
	});
	res.status(200).json(result);
};
