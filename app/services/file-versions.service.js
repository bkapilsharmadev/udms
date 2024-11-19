const fileVersionModel = require("../models/file-versions.model");
const { dbError, notFoundError, internalServerError } = require("../utils/error/error");
const path = require('path');
const fs = require('fs');

module.exports.createFileVersion = async (fileVersion) => {
    const result = await fileVersionModel.createFileVersion(fileVersion);
    if (!result) {
        throw new Error("Error creating file version");
    }
    return { message: "File version created successfully" };
};

module.exports.getFileVersions = async () => {
    const result = await fileVersionModel.getFileVersions();
    return result || [];
};

module.exports.deleteFileVersion = async (version_id) => {
    const result = await fileVersionModel.deleteFileVersion(version_id);
    if (!result) {
        throw new Error("Error deleting file version");
    }
    return { message: "File version deleted successfully" };
};

module.exports.updateFileVersion = async (fileVersion) => {
    const result = await fileVersionModel.updateFileVersion(fileVersion);
    if (!result) {
        throw new Error("Error updating file version");
    }
    return { message: "File version updated successfully" };
};

module.exports.getFileVersionsByDocumentId = async (document_id) => {
    const result = await fileVersionModel.getFileVersionsByDocumentId(document_id);
    return result || [];
};

module.exports.downloadFile = async (version_id, req, res) => {
    const result = await fileVersionModel.getFileByVersionId(version_id);
    if (result.length == 0) {
        throw dbError({
            moduleName: "file-versions.service.js",
            message: "Error In Fetching File",
            data: result,
        });
    }

    const uploadsDir = path.resolve(__dirname, '../../uploads');
    const filename = path.basename(result[0].document_url); 
    const filePath = path.join(uploadsDir, filename);

    console.log("file path ",filePath);

    if (!fs.existsSync(filePath)) {
        throw notFoundError({
            moduleName: "file-versions.service.js",
            message: "File Not Found",
        });
    }

    res.download(filePath, filename, (err) => {
        if (err) {
            throw internalServerError({
                moduleName: "file-versions.service.js",
                message: "Error In Downloading File",
            });
        }
    });
}