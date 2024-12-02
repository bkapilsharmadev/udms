const documentReviewFilesService = require("../services/document-review-files.service");

module.exports.getDocumentReviewFilesByReviewId = async (req, res, next) => {
    const { review_id } = req.query;
    const result = await documentReviewFilesService.getDocumentReviewFilesByReviewId(
        review_id
    );
    res.status(200).json(result);
}