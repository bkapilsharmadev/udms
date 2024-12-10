const { dbError, invalidRequestError } = require("../utils/error/error");
const documentCategoryModel = require("../models/document-categories.model");
const { excelBufferToJSON, validateExcel, createExcelFile, areFieldsUnique } = require("../utils/utils");
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
module.exports.createDocumentCategoryViaExcel = async(buffer, dbTransaction, created_by) => {
    let jsonData = await excelBufferToJSON(buffer);
    if(!jsonData){
        throw invalidRequestError({
            message: "Invalid Excel File. Please Upload In Mentioned Format",
            moduleName: "document-categories.service.js"
        })
    }
    // Validate headers and data  
    const validateExcelData = validateExcel(jsonData,DOCUMENT_CATEGORY_HEADERS);
    if (!validateExcelData) {
        throw invalidRequestError({
            moduleName: "document-categories.service.js",
            message: "Validation Failed",
        });
    }

    // Checking Existing Documents
    const existingDocumentCategories = await documentCategoryModel.getDocumentCategories();

    if(existingDocumentCategories){
        const fieldMapping = {
            "Category Name": "document_category",
            "Category Abbreviation": "category_abbr"
        };
        const fieldsUnique = areFieldsUnique(jsonData, existingDocumentCategories, fieldMapping);
        console.log("reached", fieldsUnique);
        
        if (!fieldsUnique) {
            throw invalidRequestError({
                moduleName: "document-categories.service.js",
                message: "Category Name OR Abbrevation Already Exists"
            })
        }
    }

    const updatedData = jsonData.map((item) => ({
        ...item,
        created_by,
    }));

    const result = await documentCategoryModel.createDocumentCategoriesViaExcel(existingDocumentCategories, updatedData,dbTransaction);
    if(!result){
        throw dbError({
            moduleName: "document-categories.service.js",
            message: "Error while Creating Doucment Categories",
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