
const documentCategoryService = require("../services/document-categories.service");

module.exports.renderDocumentCategories = async (req, res, next) => {
    const documentCategories = await documentCategoryService.getDocumentCategories();
    res.render("document-categories.ejs", { documentCategories });
};

module.exports.createDocumentCategory = async (req, res, next) => {
    const { document_category, category_abbr, description, parent_id } = req.body;
    const created_by = res.locals.username;
    const result = await documentCategoryService.createDocumentCategory({
        document_category,
        category_abbr,
        description,
        parent_id,
        created_by,
    });
    res.status(201).json(result);
};

module.exports.updateDocumentCategory = async (req, res, next) => {
    const { category_id, document_category, category_abbr, description, parent_id } = req.body;
    const updated_by = res.locals.username;
    const result = await documentCategoryService.updateDocumentCategory({
        category_id,
        document_category,
        category_abbr,
        description,
        parent_id,
        updated_by
    })
    res.status(200).json(result);
}

