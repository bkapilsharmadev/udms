const documentCategoryService = require("../services/document-categories.service");

module.exports.renderDocumentCategories = async (req, res, next) => {
    const documentCategories = await documentCategoryService.getDocumentCategories();
    res.render("document-categories.ejs", { documentCategories });
};

module.exports.createDocumentCategory = async (req, res, next) => {
    const { document_category, category_abbr, description, parent_id } = req.body;
    const result = await documentCategoryService.createDocumentCategory({
        document_category,
        category_abbr,
        description,
        parent_id,
        created_by : req.session_username
    });
    res.status(201).json(result);
};

module.exports.createDocumentCategoriesViaExcel = async (req,res,next) => {
	if(!req.file){
		// throw 
	}
    let buffer = req.file.buffer;    
    const result = await documentCategoryService.createDocumentCategoryViaExcel(buffer, req.session_username);
    if(result){
     res.status(200).json({
        success: true,
        message: 'Document categories created successfully',
        data: result
      });    
    }
}

module.exports.downloadCreateCategoriesExcel = async (req,res,next) => {

    const buffer = await documentCategoryService.downloadCreateCategoriesExcel();
    console.log("buffer : ",buffer);
    
    // Step 4: Set headers and send the buffer
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="example.xlsx"');
    res.send(buffer);
}

module.exports.updateDocumentCategory = async (req, res, next) => {
    const { category_id, document_category, category_abbr, description, parent_id } = req.body;
    const result = await documentCategoryService.updateDocumentCategory({
        category_id,
        document_category,
        category_abbr,
        description,
        parent_id,
        updated_by : req.session_username
    })
    res.status(200).json(result);
}

module.exports.deleteDocumentCategory = async (req, res, next) => {
    const { category_id } = req.body;
    const result = await documentCategoryService.deleteDocumentCategory(category_id);
    res.status(200).json(result);
}

module.exports.fetchDocumentCategory = async (req, res, next) => {
    const { category_id } = req.params;
    const result = await documentCategoryService.fetchDocumentCategory(category_id);
    res.status(200).json(result);
}
