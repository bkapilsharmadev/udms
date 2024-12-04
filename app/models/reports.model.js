const { write_db_config, read_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

module.exports.docsCreatedCount = async (data, dbTransaction = null) => {
	const { session_user } = data;
	const query = `
    SELECT COUNT(document_id) AS total_docs_created 
    FROM documents 
    WHERE 
        created_by = $1
        AND active = true;`;
	const values = [session_user];

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows?.[0]?.total_docs_created;
};

module.exports.docsReceivedCount = async (data, dbTransaction = null) => {
    const { session_user } = data;
    const query = `
    SELECT DISTINCT COUNT(d.document_id) AS total_docs_received
    FROM document_reviews dr
    INNER JOIN documents d ON d.document_id = dr.document_id
    WHERE 
        dr.to_be_reviewed_by = $1
        AND d.created_by <> $1
        AND dr.active = true
        AND d.active = true;`;
    const values = [session_user];

    const client = dbTransaction || sqlRead;
    const result = await client.query(query, values);
    return result.rows?.[0]?.total_docs_received;
}

module.exports.docsPendingCount = async (data, dbTransaction = null) => {
    const { session_user } = data;
    const query = `
    SELECT COUNT(DISTINCT dr.document_id) AS total_docs_pending
    FROM document_reviews dr
    INNER JOIN documents d ON d.document_id = dr.document_id
    WHERE 
        d.status IS NULL
        AND d.active = true
        AND dr.active = true
        AND 
        ( 
            (
                dr.to_be_reviewed_by = $1
                AND d.created_by <> $1
            )
            OR
            (
                d.created_by = $1
            )
        );`;
    const values = [session_user];

    const client = dbTransaction || sqlRead;
    const result = await client.query(query, values);
    return result.rows?.[0]?.total_docs_pending;
}

module.exports.docsApprovedCount = async (data, dbTransaction = null) => {
    const { session_user } = data;
    const query = `
    SELECT COUNT(DISTINCT dr.document_id) AS total_docs_approved
    FROM document_reviews dr
    INNER JOIN documents d ON d.document_id = dr.document_id
    WHERE 
        d.status = 'APPROVED'
        AND d.active = true
        AND dr.active = true
        AND 
        ( 
            (
                dr.to_be_reviewed_by = $1
                AND d.created_by <> $1
            )
            OR
            (
                d.created_by = $1
            )
        );`;
    const values = [session_user];

    const client = dbTransaction || sqlRead;
    const result = await client.query(query, values);
    return result.rows?.[0]?.total_docs_approved;
}

module.exports.docsRejectedCount = async (data, dbTransaction = null) => {
    const { session_user } = data;
    const query = `
    SELECT COUNT(DISTINCT dr.document_id) AS total_docs_rejected
    FROM document_reviews dr
    INNER JOIN documents d ON d.document_id = dr.document_id
    WHERE 
        d.status = 'REJECTED'
        AND d.active = true
        AND dr.active = true
        AND 
        ( 
            (
                dr.to_be_reviewed_by = $1
                AND d.created_by <> $1
            )
            OR
            (
                d.created_by = $1
            )
        );`;
    const values = [session_user];

    const client = dbTransaction || sqlRead;
    const result = await client.query(query, values);
    return result.rows?.[0]?.total_docs_rejected;
}

module.exports.docsApprovalTimeStats = async (data, dbTransaction = null) => {
    const { session_user } = data;
    const query = `
    WITH filtered_docs AS (
        SELECT document_id 
        FROM documents 
        WHERE is_final_approval = true AND created_by = $1
        
        UNION
        
        SELECT DISTINCT d.document_id
        FROM document_reviews dr
        INNER JOIN documents d ON d.document_id = dr.document_id
        WHERE 
            dr.to_be_reviewed_by = $1
            AND d.created_by <> $1
            AND dr.active = true
            AND d.active = true
            AND d.is_final_approval = true
    ),
    document_time_diff AS (
        SELECT
            dr.document_id,
            MIN(dr.reviewed_at) AS first_review_time,
            MAX(dr.reviewed_at) AS final_review_time
        FROM document_reviews dr
        WHERE dr.document_id IN (SELECT document_id FROM filtered_docs)
        GROUP BY dr.document_id
    ),
    document_durations AS (
        SELECT
            document_id,
            EXTRACT(EPOCH FROM (final_review_time - first_review_time)) AS duration_seconds
        FROM document_time_diff
    ),
    formatted_durations AS (
        SELECT
            MIN(duration_seconds) AS min_duration_seconds,
            MAX(duration_seconds) AS max_duration_seconds,
            AVG(duration_seconds) AS avg_duration_seconds
        FROM document_durations
    )
    SELECT
        ROUND(min_duration_seconds / 3600, 2) AS min_time_in_hours,
        ROUND(max_duration_seconds / 3600, 2) AS max_time_in_hours,
        ROUND(avg_duration_seconds / 3600, 2) AS average_time_in_hours
        FROM formatted_durations;`;
    const values = [session_user];

    const client = dbTransaction || sqlRead;
    const result = await client.query(query, values);
    return result.rows?.[0] || {};
}