const { dbError } = require("../utils/error/error");
const documentModel = require("../models/documents.model");

module.exports.createDocument = async (document) => {
    console.log(document);
    
    const documents = await documentModel.createDocument(document);
    if (!document?.document_id) {
        throw dbError({ message: "Error creating document", data: result });
    }

    //handle multiple files upload by calling fileService.createFile()


    return { message: "Document created successfully" };
};

module.exports.getDocuments = async () => {
    const result = await documentModel.getDocuments();
    return result || [];
};

module.exports.deleteDocument = async (document_id) => {
    const result = await documentModel.deleteDocument(document_id);
    if (!result) {
        throw dbError({ message: "Error deleting document", data: result });
    }
    return { message: "Document deleted successfully" };
};

module.exports.updateDocument = async (document) => {
    const result = await documentModel.updateDocument(document);
    if (!result) {
        throw dbError({ message: "Error updating document", data: result });
    }
    return { message: "Document updated successfully" };
};
