const { dbError } = require("../utils/error/error");
const documentService = require("../services/documents.service");

module.exports.renderDocuments = async (req, res, next) => {
    res.render("documents.ejs");
};

module.exports.createDocument = async (req, res, next) => {
    const { ref_no, description, received_from, university_entt_id, campus_entt_id, school_entt_id, department_entt_id, mentor_sign, document_stage, status, created_by } = req.body;
    const result = await documentService.createDocument({
        ref_no, description, received_from, university_entt_id, campus_entt_id, school_entt_id, department_entt_id, mentor_sign, document_stage, status, created_by
    });
    res.status(201).json(result);
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
    const result = await documentService.updateDocument({ document_id, ref_no, description, updated_by });
    res.status(200).json(result);
};
