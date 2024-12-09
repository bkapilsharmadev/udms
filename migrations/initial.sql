DROP TYPE IF EXISTS document_categories;
CREATE TABLE document_categories (
	category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_category VARCHAR(50) UNIQUE,
	category_abbr VARCHAR(10) UNIQUE,
    description TEXT,
	parent_id INT REFERENCES document_categories (category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

-- ===========================================
DROP TABLE IF EXISTS document_refs;
CREATE TABLE document_refs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INT NOT NULL,
    abbr VARCHAR(20) NOT NULL, -- Stores the category abbreviation (e.g., PR/PO)
    seq_no INT NOT NULL, -- Stores the sequence number (e.g., 001)
    ref_date DATE NOT NULL, -- Stores the date (e.g., 2024-10-07)
    ref_number VARCHAR(30) UNIQUE, -- Generated REF number (e.g., PR/PO-07102024-001)
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES document_categories(category_id),
    UNIQUE (category_id, ref_date, seq_no) -- Ensures no duplicate sequence numbers per day/category
);

CREATE OR REPLACE FUNCTION generate_ref_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Construct the REF number
    NEW.ref_number := NEW.abbr || '-' || TO_CHAR(NEW.ref_date, 'DDMMYYYY') || '-' || LPAD(NEW.seq_no::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_generate_ref_number
BEFORE INSERT ON document_refs
FOR EACH ROW
EXECUTE FUNCTION generate_ref_number();

-- -------------------------------------------
DO $$
DECLARE
    category RECORD;
    seq_no INT;
    day_offset INT; -- Loop through days as offsets (0 to 6)
    target_date DATE;
BEGIN
    -- Loop through all categories
    FOR category IN
        SELECT category_id, category_abbr FROM document_categories
    LOOP
        -- Loop through the next 7 days
        FOR day_offset IN 0..30 LOOP
            -- Calculate the target date for the current offset
            target_date := CURRENT_DATE + day_offset;

            -- Generate 1000 sequences for each category and day
            FOR seq_no IN 1..1000 LOOP
                INSERT INTO document_refs (category_id, abbr, seq_no, ref_date)
                VALUES (category.category_id, category.category_abbr, seq_no, target_date)
                ON CONFLICT DO NOTHING; -- Avoid duplicates if rerun
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ===========================================

DROP TYPE IF EXISTS document_stages;
CREATE TABLE document_stages (
    document_stage VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS document_stage_users;
CREATE TABLE document_stage_users (
    username VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    document_stage VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS status_types;
CREATE TABLE status_types (
    status_type VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
	created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS entity_types;
CREATE TABLE entity_types (
    entity_type VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS entities;
CREATE TABLE entities (
    entity_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL REFERENCES entity_types (entity_type),
    parent_id INT REFERENCES entities (entity_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS _enum_mentor_sign_status;
CREATE TYPE _enum_mentor_sign_status AS ENUM ('NOT REQUIRED', 'YES', 'NO', 'ON LEAVE');


DROP TABLE IF EXISTS documents CASCADE;
CREATE TABLE documents (
    document_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
	category_id INT REFERENCES document_categories(category_id),
    ref_no VARCHAR(50) UNIQUE,
    description TEXT,
    received_from INT REFERENCES entities (entity_id),
    university_entt_id INT REFERENCES entities (entity_id),
    campus_entt_id INT REFERENCES entities (entity_id),
    school_entt_id INT REFERENCES entities (entity_id),
    department_entt_id INT REFERENCES entities (entity_id),
    mentor_sign _enum_mentor_sign_status DEFAULT 'NOT REQUIRED',
    document_stage VARCHAR(50) REFERENCES document_stages (document_stage),
    status VARCHAR(50) REFERENCES status_types (status_type) DEFAULT('PENDING'),
    is_final_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
	active BOOLEAN DEFAULT TRUE
);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_final_approval BOOLEAN DEFAULT FALSE;

DROP TABLE IF EXISTS files CASCADE;
CREATE TABLE files (
    file_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    latest_version_id INT,
    document_id INT NOT NULL REFERENCES documents (document_id),
    document_uuid UUID NOT NULL REFERENCES documents (document_uuid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS file_versions;
CREATE TABLE file_versions (
    version_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_id INT NOT NULL REFERENCES files (file_id),
    file_name VARCHAR(255) NOT NULL,
    version_number INT NOT NULL,
    document_id INT NOT NULL REFERENCES documents (document_id),
    document_uuid UUID NOT NULL REFERENCES documents (document_uuid),
    hash VARCHAR(255),
    file_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS document_reviews CASCADE;
CREATE TABLE document_reviews (
    review_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id INT NOT NULL REFERENCES documents (document_id),
    document_uuid UUID NOT NULL REFERENCES documents (document_uuid),
    to_be_reviewed_by VARCHAR(20),
    reviewed_by VARCHAR(20),
    reviewed_at TIMESTAMP,
    document_stage VARCHAR(50),
    forwarded_to VARCHAR(20),
    status VARCHAR(50) NOT NULL REFERENCES status_types (status_type),
	created_status VARCHAR(50) NOT NULL REFERENCES status_types (status_type),
    comments TEXT,
    is_final_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);
ALTER TABLE document_reviews ADD COLUMN IF NOT EXISTS is_final_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE document_reviews ADD COLUMN IF NOT EXISTS created_status VARCHAR(50) REFERENCES status_types (status_type);

DROP TABLE IF EXISTS document_review_files CASCADE;
CREATE TABLE IF NOT EXISTS document_review_files (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id INT NOT NULL REFERENCES document_reviews (review_id),
    file_id INT NOT NULL REFERENCES files (file_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);


CREATE OR REPLACE FUNCTION increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there is an existing version for the same file_id
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
  FROM file_versions
  WHERE file_id = NEW.file_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_increment_version_number
BEFORE INSERT ON file_versions
FOR EACH ROW
EXECUTE FUNCTION increment_version_number();

--==========================

-- get all documents with their latest version and file details and other details
SELECT 
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
    dr.review_created_by
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
        dr.updated_at AS review_updated_at,
        dr.created_by AS review_created_by
    FROM document_reviews dr
    INNER JOIN entities e ON (dr.to_be_reviewed_by::INT = e.entity_id)
    INNER JOIN document_stage_users dsu ON dr.created_by = dsu.username
    WHERE dr.document_id = d.document_id
    ORDER BY dr.reviewed_at DESC
    LIMIT 1
) dr ON true

WHERE d.active = TRUE
	AND (
    -- Check if the current user is the creator of the document
    d.created_by = '50583955' 
    OR 
    -- Check if the document has been forwarded to the current user at any point
    EXISTS (
      SELECT 1 
      FROM document_reviews dr
      WHERE dr.document_id = d.document_id
      AND dr.forwarded_to::INT = '50583955'::INT
    )
  );

-- get all self created documents with their latest version and file details and other detail
SELECT 
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
    ORDER BY dr.reviewed_at DESC
    LIMIT 1
) dr ON true
WHERE d.active = TRUE AND d.created_by = '50583955';


--received documents
SELECT 
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
    ORDER BY dr.reviewed_at DESC
    LIMIT 1
) dr ON true
WHERE d.active = TRUE
    AND (
    -- Check if the document has been forwarded to the current user at any point
    EXISTS (
        SELECT 1 
        FROM document_reviews dr
        WHERE dr.document_id = d.document_id
        AND dr.forwarded_to::INT = '50583955'::INT
    )
    );


--============================
-- fetch single document details
SELECT 
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
    d.created_by
FROM documents d
INNER JOIN document_categories dc ON d.category_id = dc.category_id
-- Join with entities table for document-related entity information
INNER JOIN entities ef ON d.received_from = ef.entity_id
INNER JOIN entities eu ON d.university_entt_id = eu.entity_id
INNER JOIN entities ec ON d.campus_entt_id = ec.entity_id
INNER JOIN entities es ON d.school_entt_id = es.entity_id
INNER JOIN entities ed ON d.department_entt_id = ed.entity_id
WHERE d.document_id = 1;

-- document files
SELECT fv.* FROM files f 
INNER JOIN file_versions fv ON f.latest_version_id = fv.version_id
WHERE f.document_id = 1;

-- document reviews
SELECT * FROM document_reviews
WHERE document_id = 1
ORDER BY reviewed_at DESC NULLS FIRST
LIMIT 1

-- check if current user has reviewed the document
SELECT * FROM document_reviews 
	WHERE document_id = 10 
	AND to_be_reviewed_by = '50583955'
	AND reviewed_by IS NOT NULL
--============================

    -- let perPageData = `<%- dataPerPage %>`;
    -- let totalDataCount = `<%- totalDataCount %>`;
    -- let totalPages = Math.ceil(Number(totalDataCount) / perPageData);
    -- let paginationArr = [];
    -- let dataFilterObj = {
    --   getTotalCount: false,
    --   pageNo: 1,
    --   cursor: undefined,
    --   filterCriteria: [],
    --   searchCriteria: {
    --     searchColumns: [],
    --     searchTerms: []
    --   },
    --   orderCriteria: [],
    --   pageSize: perPageData,
    --   findById: false
    -- };


-- CHECK EDITABLE DOCUMENTS
WITH review_cte AS (
	SELECT 
	review_id, 
	document_id, 
	to_be_reviewed_by, 
	reviewed_by,
	status,
	created_by,
	created_status,
	(SELECT COUNT(*) FROM document_reviews WHERE document_id = 1 and active = true) 
	FROM document_reviews 
	WHERE document_id = 1 AND active = true 
	ORDER BY reviewed_at 
	DESC LIMIT 1
)
SELECT 
    review_id,
    document_id,
    CASE
        WHEN (count <= 2 AND reviewed_by IS NULL) 
             OR (created_status = 'SENT FOR REVISION' AND to_be_reviewed_by = '50583955') 
		THEN TRUE
        ELSE FALSE
    END AS is_editable
FROM review_cte;

-- UPDATE DOCUMENT LOGIC
-- 1. Check if the document has been reviewed by any user
    -- IF NOT
        -- Update the document details in "document" table.
        -- Insert new file(s) and version(s) in "files" and "file_versions" table.
        -- Update the existing "document_reviews(active)" for the "document_id" to "false".
        -- Insert a new "document_reviews" record with the updated details.
    -- IF YES
        -- Update the document details in "document" table.
        -- Insert new file(s) and version(s) in "files" and "file_versions" table.
        -- Insert a new "document_reviews" record with the updated details.
        


-- Docs Created
SELECT document_id 
FROM documents 
WHERE 
	created_by = '50583955'
	AND active = true;

-- Docs Received
SELECT DISTINCT d.document_id, d.created_by
FROM document_reviews dr
INNER JOIN documents d ON d.document_id = dr.document_id
WHERE 
	dr.to_be_reviewed_by = '50583955'
	AND d.created_by <> '50583955'
	AND dr.active = true
	AND d.active = true;

-- Pending Docs
SELECT dr.document_id, d.created_by, dr.to_be_reviewed_by, dr.reviewed_by
FROM document_reviews dr
INNER JOIN documents d ON d.document_id = dr.document_id
WHERE 
	d.status IS NULL
	AND d.active = true
	AND dr.active = true
	AND 
	( 
		(
			dr.to_be_reviewed_by = '50583955'
			AND d.created_by <> '50583955'
		)
		OR
		(
			d.created_by = '50583955'
		)
	)




-- Docs Created
SELECT document_id 
FROM documents 
WHERE 
	created_by = '50583955'
	AND active = true;

-- Docs Received
SELECT DISTINCT COUNT(d.document_id)
FROM document_reviews dr
INNER JOIN documents d ON d.document_id = dr.document_id
WHERE 
	dr.to_be_reviewed_by = '50583955'
	AND d.created_by <> '50583955'
	AND dr.active = true
	AND d.active = true;

-- Pending Docs
SELECT COUNT(DISTINCT dr.document_id)
FROM document_reviews dr
INNER JOIN documents d ON d.document_id = dr.document_id
WHERE 
	d.status IS NULL
	AND d.active = true
	AND dr.active = true
	AND 
	( 
		(
			dr.to_be_reviewed_by = '50583955'
			AND d.created_by <> '50583955'
		)
		OR
		(
			d.created_by = '50583955'
		)
	)

-- Docs Approved
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
			dr.to_be_reviewed_by = '50583955'
			AND d.created_by <> '50583955'
		)
		OR
		(
			d.created_by = '50583955'
		)
	);

-- Docs Rejected
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
            dr.to_be_reviewed_by = '50583955'
            AND d.created_by <> '50583955'
        )
        OR
        (
            d.created_by = '50583955'
        )
    );

-- Avg, Min and Max Time Taken
WITH filtered_docs AS (
    -- Select documents created by '50583955' with final approval
    SELECT document_id 
    FROM documents 
    WHERE is_final_approval = true AND created_by = '50583955'
    
    UNION
    
    -- Select documents assigned to '50583955' for review but created by someone else
    SELECT DISTINCT d.document_id
    FROM document_reviews dr
    INNER JOIN documents d ON d.document_id = dr.document_id
    WHERE 
        dr.to_be_reviewed_by = '50583955'
        AND d.created_by <> '50583955'
        AND dr.active = true
        AND d.active = true
        AND d.is_final_approval = true
),
document_time_diff AS (
    -- Calculate the first and final review times for documents in filtered_docs
    SELECT
        dr.document_id,
        MIN(dr.reviewed_at) AS first_review_time,
        MAX(dr.reviewed_at) AS final_review_time
    FROM document_reviews dr
    WHERE dr.document_id IN (SELECT document_id FROM filtered_docs)
    GROUP BY dr.document_id
),
document_durations AS (
    -- Calculate the duration in seconds for each document
    SELECT
        document_id,
        EXTRACT(EPOCH FROM (final_review_time - first_review_time)) AS duration_seconds
    FROM document_time_diff
),
formatted_durations AS (
    -- Calculate the minimum, maximum, and average durations
    SELECT
        MIN(duration_seconds) AS min_duration_seconds,
        MAX(duration_seconds) AS max_duration_seconds,
        AVG(duration_seconds) AS avg_duration_seconds
    FROM document_durations
)
-- Convert durations into days, hours, and minutes
SELECT
    CONCAT(
        TRUNC(min_duration_seconds / 86400), ' days, ',
        TRUNC(MOD(min_duration_seconds, 86400) / 3600), ' hours, ',
        TRUNC(MOD(min_duration_seconds, 3600) / 60), ' minutes'
    ) AS min_time_taken,
    CONCAT(
        TRUNC(max_duration_seconds / 86400), ' days, ',
        TRUNC(MOD(max_duration_seconds, 86400) / 3600), ' hours, ',
        TRUNC(MOD(max_duration_seconds, 3600) / 60), ' minutes'
    ) AS max_time_taken,
    CONCAT(
        TRUNC(avg_duration_seconds / 86400), ' days, ',
        TRUNC(MOD(avg_duration_seconds, 86400) / 3600), ' hours, ',
        TRUNC(MOD(avg_duration_seconds, 3600) / 60), ' minutes'
    ) AS average_time_taken
FROM formatted_durations;






-- SELECT * FROM documents WHERE created_by = '50583955';

-- SELECT DISTINCT(document_id) FROM document_reviews WHERE active = true
-- 	AND to_be_reviewed_by = '50583955'

WITH filtered_docs AS (
	SELECT DISTINCT(document_id) 
	FROM document_reviews 
	WHERE 
		active = true
		AND to_be_reviewed_by = '50583955'
)
SELECT 
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
INNER JOIN filtered_docs fd ON fd.document_id  = d.document_id
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
        AND dr.active = true
    ORDER BY dr.reviewed_at DESC NULLS FIRST
    LIMIT 1
) dr ON true