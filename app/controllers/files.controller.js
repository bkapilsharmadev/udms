const fileService = require("../services/files.service");

module.exports.renderFiles = async (req, res, next) => {
    res.render("files.ejs");
};

module.exports.createFile = async (req, res, next) => {
    const { document_id, document_uuid } = req.body;
    const result = await fileService.createFile({ document_id, document_uuid, created_by: req.session_username });
    res.status(201).json(result);
};

module.exports.getFiles = async (req, res, next) => {
    const result = await fileService.getFiles();
    res.status(200).json(result);
};

module.exports.deleteFile = async (req, res, next) => {
    const { file_id } = req.body;
    const result = await fileService.deleteFile(file_id);
    res.status(200).json(result);
};

module.exports.updateFile = async (req, res, next) => {
    const { file_id, latest_version_id } = req.body;
    const result = await fileService.updateFile({ file_id, latest_version_id, updated_by: req.session_username });
    res.status(200).json(result);
};
