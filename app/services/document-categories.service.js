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
    return { message: "Document Category created successfully" };
}

module.exports.updateDocumentCategory = async(documentCategory) => {
    const result = documentCategoryModel.updateDocumentCategory(documentCategory);
    if(!result){
        throw dbError({
            moduleName: "document-categories.service.js",
            message: "Error updating document category",
            data: result,
        });
    }
    return { message: "Document Category updated successfully" };
}