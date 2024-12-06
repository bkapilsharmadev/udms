const { dbError } = require("../utils/error/error");
const documentCategoryModel = require("../models/document-categories.model");
const { excelBufferToJSON, validateExcel } = require("../utils/utils");

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
module.exports.createDocumentCategoryViaExcel = async(buffer) => {
    let jsonData = excelBufferToJSON(buffer);
    // Validate headers and data
    const headers = [
        { fieldName: 'Category Name', isRequired: true },
        { fieldName: 'Category Abbreviation', isRequired: true },
        { fieldName: 'Description', isRequired: false },
        { fieldName: 'Parent Category', isRequired: false }
    ]
    console.log(jsonData[1]);
    
    const validateExcelData = validateExcel(jsonData,headers);
    console.log(validateExcelData);
        

    // Perform bulk insert or individual inserts
    // const result = await documentCategoryModel.bulkCreateCategories(
    //     processedCategories
    // );
    
    return true;
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