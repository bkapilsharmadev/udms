const fileVersionModel = require("../models/file-versions.model");

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
