const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

// Create a new document
module.exports.createDocument = async (documentData, dbTransaction = null) => {
	const {
		category_id,
		ref_no,
		description,
		received_from,
		university_entt_id,
		campus_entt_id,
		school_entt_id,
		department_entt_id,
		mentor_sign,
		document_stage,
		created_by,
	} = documentData;

	const query = `INSERT INTO documents (category_id, ref_no, description, received_from, university_entt_id, campus_entt_id, school_entt_id, department_entt_id, mentor_sign, document_stage, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING document_id, document_uuid;`;
	const values = [
		category_id,
		ref_no,
		description,
		received_from,
		university_entt_id,
		campus_entt_id,
		school_entt_id,
		department_entt_id,
		mentor_sign,
		document_stage,
		created_by,
	];

    const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result?.rows?.[0] ?? [];
};

// Get all documents
module.exports.getDocuments = async (sessionUsername, dbTransaction = null) => {
	const query = `SELECT 
    d.document_id, 
    d.document_uuid, 
    d.ref_no, 
    d.description,
	d.category_id,
	dc.document_category,
    d.received_from,
    ef.name AS entity_from,
    d.university_entt_id,
    eu.name AS entity_university,
    d.campus_entt_id,
    ec.name AS entity_campus,
    d.school_entt_id,
    es.name AS entity_school,
    d.department_entt_id,
    ed.name AS entity_department,
    d.mentor_sign, 
    d.document_stage, 
    d.status, 
    d.created_at, 
    d.updated_at, 
    d.created_by,

    -- Latest review details
    dr.review_id,
    dr.to_be_reviewed_by,
	dr.to_be_reviewed_by_name,
    dr.reviewed_by,
    dr.reviewed_at,
    dr.forwarded_to,
    dr.review_status,
    dr.comments,
    dr.review_created_at,
    dr.review_updated_at

FROM documents d
INNER JOIN document_categories dc ON d.category_id = dc.category_id
-- Join with entities table for document-related entity information
INNER JOIN entities ef ON d.received_from = ef.entity_id
INNER JOIN entities eu ON d.university_entt_id = eu.entity_id
INNER JOIN entities ec ON d.campus_entt_id = ec.entity_id
INNER JOIN entities es ON d.school_entt_id = es.entity_id
INNER JOIN entities ed ON d.department_entt_id = ed.entity_id

-- Left join LATERAL to get the latest review for each document
LEFT JOIN LATERAL (
    SELECT 
        dr.review_id,
        dr.to_be_reviewed_by,
		e.name AS to_be_reviewed_by_name,
        dr.reviewed_by,
        dr.reviewed_at,
        dr.forwarded_to, 
        dr.status AS review_status,
        dr.comments,
        dr.created_at AS review_created_at,
        dr.updated_at AS review_updated_at
    FROM document_reviews dr
    INNER JOIN entities e ON (dr.to_be_reviewed_by::INT = e.entity_id)
    WHERE dr.document_id = d.document_id
    ORDER BY dr.reviewed_at DESC NULLS FIRST
    LIMIT 1
) dr ON true

WHERE d.active = TRUE
	AND (
    -- Check if the current user is the creator of the document
    d.created_by = $1 
    OR 
    -- Check if the document has been forwarded to the current user at any point
    EXISTS (
      SELECT 1 
      FROM document_reviews dr
      WHERE dr.document_id = d.document_id
      AND dr.forwarded_to::INT = $1::INT
    )
  );`;
	const values = [sessionUsername];

    const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows;
};

// Get all my documents
module.exports.getMyDocuments = async (sessionUsername, dbTransaction = null) => {
	const query = `SELECT 
    d.document_id, 
    d.document_uuid, 
    d.ref_no, 
    d.description,
	d.category_id,
	dc.document_category,
    d.received_from,
    ef.name AS entity_from,
    d.university_entt_id,
    eu.name AS entity_university,
    d.campus_entt_id,
    ec.name AS entity_campus,
    d.school_entt_id,
    es.name AS entity_school,
    d.department_entt_id,
    ed.name AS entity_department,
    d.mentor_sign, 
    d.document_stage, 
    d.status, 
    d.created_at, 
    d.updated_at, 
    d.created_by,

    -- Latest review details
    dr.review_id,
    dr.to_be_reviewed_by,
	dr.to_be_reviewed_by_name,
    dr.reviewed_by,
    dr.reviewed_at,
    dr.forwarded_to,
    dr.review_status,
    dr.comments,
    dr.review_created_at,
    dr.review_updated_at,
    dr.review_created_by,
    dr.review_created_by_name
FROM documents d
INNER JOIN document_categories dc ON d.category_id = dc.category_id
-- Join with entities table for document-related entity information
INNER JOIN entities ef ON d.received_from = ef.entity_id
INNER JOIN entities eu ON d.university_entt_id = eu.entity_id
INNER JOIN entities ec ON d.campus_entt_id = ec.entity_id
INNER JOIN entities es ON d.school_entt_id = es.entity_id
INNER JOIN entities ed ON d.department_entt_id = ed.entity_id

-- Left join LATERAL to get the latest review for each document
LEFT JOIN LATERAL (
    SELECT 
        dr.review_id,
        dr.to_be_reviewed_by,
		CONCAT(dsur.first_name, ' ', dsur.last_name, '-', dsur.document_stage) AS to_be_reviewed_by_name,
        dr.reviewed_by,
        dr.reviewed_at,
        dr.forwarded_to, 
        dr.status AS review_status,
        dr.comments,
        dr.created_at AS review_created_at,
        dr.updated_at AS review_updated_at,
        dr.created_by AS review_created_by,
        CONCAT(dsu.first_name, ' ', dsu.last_name, '-', dsu.document_stage) AS review_created_by_name
    FROM document_reviews dr
    INNER JOIN document_stage_users dsur ON dr.to_be_reviewed_by = dsur.username
    INNER JOIN document_stage_users dsu ON dr.created_by = dsu.username
    WHERE dr.document_id = d.document_id
    ORDER BY dr.reviewed_at DESC NULLS FIRST
    LIMIT 1
) dr ON true
WHERE d.active = TRUE AND d.created_by::TEXT = $1::TEXT;`;
	const values = [sessionUsername];
    
    const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows;
};

module.exports.getDocumentById = async (document_id, dbTransaction = null) => {
    const query = `SELECT 
    d.document_id, 
    d.document_uuid, 
    d.ref_no, 
    d.description,
	d.category_id,
	dc.document_category,
    d.received_from,
    ef.name AS entity_from,
    d.university_entt_id,
    eu.name AS entity_university,
    d.campus_entt_id,
    ec.name AS entity_campus,
    d.school_entt_id,
    es.name AS entity_school,
    d.department_entt_id,
    ed.name AS entity_department,
    d.mentor_sign, 
    d.document_stage, 
    d.status, 
    d.is_final_approval,
    d.created_at, 
    d.updated_at, 
    d.created_by,
    d.is_final_approval
FROM documents d
INNER JOIN document_categories dc ON d.category_id = dc.category_id
-- Join with entities table for document-related entity information
INNER JOIN entities ef ON d.received_from = ef.entity_id
INNER JOIN entities eu ON d.university_entt_id = eu.entity_id
INNER JOIN entities ec ON d.campus_entt_id = ec.entity_id
INNER JOIN entities es ON d.school_entt_id = es.entity_id
INNER JOIN entities ed ON d.department_entt_id = ed.entity_id
WHERE d.document_id = $1;`
	const values = [document_id];
    
    const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	console.log(result.rows);
	return result.rows;
};

// Get all documents
module.exports.getReceivedDocuments = async (sessionUsername, dbTransaction = null) => {
	const query = `SELECT 
    d.document_id, 
    d.document_uuid, 
    d.ref_no, 
    d.description,
	d.category_id,
	dc.document_category,
    d.received_from,
    ef.name AS entity_from,
    d.university_entt_id,
    eu.name AS entity_university,
    d.campus_entt_id,
    ec.name AS entity_campus,
    d.school_entt_id,
    es.name AS entity_school,
    d.department_entt_id,
    ed.name AS entity_department,
    d.mentor_sign, 
    d.document_stage, 
    d.status, 
    d.created_at, 
    d.updated_at, 
    d.created_by,

    -- Latest review details
    dr.review_id,
    dr.to_be_reviewed_by,
	dr.to_be_reviewed_by_name,
    dr.reviewed_by,
    dr.reviewed_at,
    dr.forwarded_to,
    dr.review_status,
    dr.comments,
    dr.review_created_at,
    dr.review_updated_at,
    dr.review_created_by,
    dr.review_created_by_name
FROM documents d
INNER JOIN document_categories dc ON d.category_id = dc.category_id
-- Join with entities table for document-related entity information
INNER JOIN entities ef ON d.received_from = ef.entity_id
INNER JOIN entities eu ON d.university_entt_id = eu.entity_id
INNER JOIN entities ec ON d.campus_entt_id = ec.entity_id
INNER JOIN entities es ON d.school_entt_id = es.entity_id
INNER JOIN entities ed ON d.department_entt_id = ed.entity_id

-- Left join LATERAL to get the latest review for each document
LEFT JOIN LATERAL (
    SELECT 
        dr.review_id,
        dr.to_be_reviewed_by,
		CONCAT(dsur.first_name, ' ', dsur.last_name, '-', dsur.document_stage) AS to_be_reviewed_by_name,
        dr.reviewed_by,
        dr.reviewed_at,
        dr.forwarded_to, 
        dr.status AS review_status,
        dr.comments,
        dr.created_at AS review_created_at,
        dr.updated_at AS review_updated_at,
        dr.created_by AS review_created_by,
        CONCAT(dsu.first_name, ' ', dsu.last_name, '-', dsu.document_stage) AS review_created_by_name
    FROM document_reviews dr
    INNER JOIN document_stage_users dsur ON dr.to_be_reviewed_by = dsur.username
    INNER JOIN document_stage_users dsu ON dr.created_by = dsu.username
    WHERE dr.document_id = d.document_id
    ORDER BY dr.reviewed_at DESC NULLS FIRST
    LIMIT 1
) dr ON true
WHERE d.active = TRUE
    AND (
    -- Check if the document has been forwarded to the current user at any point
    EXISTS (
        SELECT 1 
        FROM document_reviews dr
        WHERE dr.document_id = d.document_id
        AND dr.forwarded_to::TEXT = $1::TEXT
    )
    );`;
	const values = [sessionUsername];
    
    const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	console.log(result.rows);
	return result.rows;
};

// Delete a document by ID
module.exports.deleteDocument = async (document_id, dbTransaction = null) => {
	const query = `UPDATE documents SET active = false WHERE document_id = $1;`;
	const values = [document_id];
    
    const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

// Update a document
module.exports.updateDocument = async (document, dbTransaction = null) => {
	const { document_id, ref_no, description, updated_by } = document;
	const query = `UPDATE documents SET ref_no = $1, description = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP WHERE document_id = $4;`;
	const values = [ref_no, description, updated_by, document_id];

    const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

// Update the final approval status of a document
module.exports.updateIsFinalApproval = async (documentData, dbTransaction = null) => {
    const { document_id, is_final_approval, session_username } = documentData;
    const query = `UPDATE documents SET is_final_approval = $1, updated_by = $2, updated_at = NOW() WHERE document_id = $3;`;
    const values = [is_final_approval, session_username, document_id];

    const client = dbTransaction || sqlWrite;
    const result = await client.query(query, values);
    return result.rowCount > 0;
};
