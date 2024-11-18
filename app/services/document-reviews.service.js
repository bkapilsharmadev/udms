const documentReviewModel = require("../models/document-reviews.model");

module.exports.createDocumentReview = async (data) => {
  // Call the model to insert the document review
  const result = await documentReviewModel.createDocumentReview(data);
  if (!result?.review_id) {
    throw dbError({ message: "Error creating document review", moduleName: "document-reviews.service.js" });
  }

  return result;
};

module.exports.getDocumentReviewById = async (review_id) => {
  const result = await documentReviewModel.getDocumentReviewById(review_id);
  return result || {};
};

module.exports.getAllDocumentReviews = async () => {
  const result = await documentReviewModel.getAllDocumentReviews();
  return result || [];
};

module.exports.updateDocumentReview = async (review_id, updatedData) => {
  const result = await documentReviewModel.updateDocumentReview(review_id, updatedData);
  return result;
};

module.exports.deleteDocumentReview = async (review_id) => {
  const result = await documentReviewModel.deleteDocumentReview(review_id);
  return result;
};
