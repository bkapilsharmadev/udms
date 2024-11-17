const { invalidRequestError, dbError } = require("../utils/error/error");
const documentCategoryModel = require("../models/document-categories.model");

module.exports.getDocumentCategories = async () => {
    const result = await documentCategoryModel.getDocumentCategories();
    return result || [];
};

module.exports.createDocumentCategory = async (documentCategory) => {
    const result = await documentCategoryModel.createDocumentCategory(documentCategory);
    if (!result) {
        throw dbError({
            moduleName: "document-categories.service.js",
            message: "Error creating document category",
            data: result,
        });
    }
    return { message: "Document category created successfully" };
}

module.exports.updateDocumentCategory = async (documentCategory) => {
    const result = documentCategoryModel.updateDocumentCategory(documentCategory);
    if (!result) {
        throw dbError({
            moduleName: "document-categories.service.js",
            message: "Error updating document category",
            data: result,
        });
    }
    return { message: "Document category updated successfully" };
}

module.exports.deleteDocumentCategory = async (category_id) => {
    const result = documentCategoryModel.deleteDocumentCategory(category_id);
    if (!result) {
        throw dbError({
            moduleName: "entities.service.js",
            message: "Error deleting document category",
            data: result,
        });
    }

    return { message: "Document category deleted successfully" };
}

module.exports.fetchDocumentCategory = async (category_id) => {
    const result = documentCategoryModel.fetchDocumentCategory(category_id);
    return result || [];
}