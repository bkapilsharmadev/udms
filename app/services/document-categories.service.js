const { dbError } = require("../utils/error/error");
const documentCategoryModel = require("../models/document-categories.model");
const { excelBufferToJSON, validateExcel, createExcelFile } = require("../utils/utils");
const { DOCUMENT_CATEGORY_HEADERS } = require("../constants");

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
    return result;
}
module.exports.createDocumentCategoryViaExcel = async(buffer,created_by) => {
    let jsonData = excelBufferToJSON(buffer);
    // Validate headers and data
    const headers = [
        { fieldName: 'Category Name', isRequired: true },
        { fieldName: 'Category Abbreviation', isRequired: true },
        { fieldName: 'Description', isRequired: false },
        { fieldName: 'Parent Category', isRequired: false }
    ]    
    const validateExcelData = validateExcel(jsonData,headers);
    if (!validateExcelData) {
        throw new Error("Excel Data validation failed");
    }
    const updatedData = jsonData.map((item) => ({
        ...item,
        created_by,
    }));

    const result = await documentCategoryModel.createDocumentCategoriesViaExcel(updatedData);
    if(!result){
        throw dbError({
            moduleName: "document-categories.service.js",
            message: "Error creating document category By Excel",
            data: result,
        });
    }
    return true;
}
module.exports.downloadCreateCategoriesExcel = async () => {
    const headers = DOCUMENT_CATEGORY_HEADERS.map((field) => field.fieldName);
    const documentCategories = await documentCategoryModel.getDocumentCategories();    
    const dropDownOptions = documentCategories.map(i => i.document_category);

    const buffer = await createExcelFile(headers,dropDownOptions,"D");
    return buffer;
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