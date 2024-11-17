const fileVersionService = require("../services/file-versions.service");

module.exports.renderFileVersions = async (req, res, next) => {
    res.render("file-versions.ejs");
};

module.exports.createFileVersion = async (req, res, next) => {
    const { file_id, file_name, version_number, document_id, document_uuid, hash, document_url } = req.body;
    const result = await fileVersionService.createFileVersion({ file_id, file_name, version_number, document_id, document_uuid, hash, document_url, created_by: req.session_username });
    res.status(201).json(result);
};

module.exports.getFileVersions = async (req, res, next) => {
    const result = await fileVersionService.getFileVersions();
    res.status(200).json(result);
};

module.exports.deleteFileVersion = async (req, res, next) => {
    const { version_id } = req.body;
    const result = await fileVersionService.deleteFileVersion(version_id);
    res.status(200).json(result);
};

module.exports.updateFileVersion = async (req, res, next) => {
    const { version_id, hash, document_url } = req.body;
    const result = await fileVersionService.updateFileVersion({ version_id, hash, document_url, updated_by: req.session_username });
    res.status(200).json(result);
};
