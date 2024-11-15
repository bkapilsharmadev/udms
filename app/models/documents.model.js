const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

// Create a new document
module.exports.createDocument = async (document) => {
    const { category_id, ref_no, description, received_from, university_entt_id, campus_entt_id, school_entt_id, department_entt_id, mentor_sign, document_stage, status, created_by } = document;
    const query = `INSERT INTO documents (ref_no, description, received_from, university_entt_id, campus_entt_id, school_entt_id, department_entt_id, mentor_sign, document_stage, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING document_id, document_uuid;`;
    const values = [category_id, ref_no, description, received_from, university_entt_id, campus_entt_id, school_entt_id, department_entt_id, mentor_sign, document_stage, status, created_by];
    const result = await sqlWrite.query(query, values);
    console.log(result);
    return result.rows[0];
};

// Get all documents
module.exports.getDocuments = async () => {
    const query = `SELECT * FROM documents WHERE active = true;`;
    const result = await sqlRead.query(query);
    return result.rows;
};

// Delete a document by ID
module.exports.deleteDocument = async (document_id) => {
    const query = `UPDATE documents SET active = false WHERE document_id = $1;`;
    const values = [document_id];
    const result = await sqlWrite.query(query, values);
    return result.rowCount > 0;
};

// Update a document
module.exports.updateDocument = async (document) => {
    const { document_id, ref_no, description, updated_by } = document;
    const query = `UPDATE documents SET ref_no = $1, description = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP WHERE document_id = $4;`;
    const values = [ref_no, description, updated_by, document_id];
    const result = await sqlWrite.query(query, values);
    return result.rowCount > 0;
};
