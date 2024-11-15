const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

//Query To Fetch All Document Catgories
module.exports.getDocumentCategories = async () => {
    const query = `SELECT * FROM document_categories WHERE active = true;`;
    const result = await sqlRead.query(query);
    return result.rows;
};

//Query To Create Document Category
module.exports.createDocumentCategory = async (documentCategory) => {
    const { document_category, category_abbr, description, parent_id, created_by } = documentCategory;

    const query = `INSERT INTO document_categories (document_category, category_abbr,description, parent_id, created_by)
	VALUES ($1, $2, $3, $4, $5);`;
    const values = [document_category, category_abbr, description, parent_id, created_by];

    const result = await sqlWrite.query(query, values);
    return result.rowCount > 0;
};

module.exports.updateDocumentCategory = async (documentCategory) => {
    const { category_id, document_category, category_abbr, description, parent_id, updated_by } = documentCategory;

    const query = `UPDATE document_categories
	SET document_category = $1, category_abbr = $2, description = $3, parent_id = $4, updated_by = $5, updated_at = NOW()
	WHERE category_id = $6;`;
    const values = [document_category, category_abbr, description, parent_id, updated_by, category_id];

    const result = await sqlWrite.query(query, values);
    return result.rowCount > 0;
}