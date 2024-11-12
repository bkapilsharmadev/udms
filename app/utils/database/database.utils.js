const { invalidRequestError } = require('../error/error');


module.exports.generateDF = (sqlOptions) => {
  let {
    selectClause, generateSeq = [],
    orderCriteria = [],
    filterCriteria = [],
    searchCriteria = [],
    isOr = false,
    pageNo = 1,
    pageSize = process.env.DEFAULT_PAGE_SIZE || 10,
    cursor,
    findById = false
  } = sqlOptions;

  // console.log('orderCriteria>>>>> ', orderCriteria);
  // console.log('filterCriteria>>>>> ', filterCriteria);
  // console.log('searchCriteria>>>>> ', searchCriteria);

  let offsetRequired = true;
  if ((cursor && orderCriteria.length === 0) || (cursor && orderCriteria[0]?.logicalName === 'cursor')) {
    offsetRequired = false;
  }

  if (!cursor && orderCriteria[0]?.logicalName === 'cursor' && pageNo > 3) {
    invalidRequestError({ moduleName: 'generateDynamicSQL', message: 'Cursor is null' });
  }

  if (!cursor && pageNo > 3) {
    invalidRequestError({ moduleName: 'generateDynamicSQL', message: 'Cursor is null' });
  }

  let cursorOrder = orderCriteria.find(elem => elem.logicalName === 'cursor')?.value || 'DESC';

  pageNo = Number(pageNo);
  pageSize = Number(pageSize);
  cursor = Number(cursor);

  if (pageSize > process.env.MAX_PAGE_SIZE) {
    pageSize = process.env.MAX_PAGE_SIZE;
  }

  if (pageSize < process.env.MIN_PAGE_SIZE) {
    pageSize = process.env.MIN_PAGE_SIZE;
  }

  if (pageNo < 1) {
    pageNo = 1;
  }

  if (!isNaN(cursor) && cursor && cursor < 1) {
    invalidRequestError({ moduleName: 'generateDynamicSQL', message: 'Cursor should be a natural number.' });
  }

  let queryText = selectClause;
  const queryValues = [];

  generateSeq.forEach((seq) => {
    if (seq.type === 'order') {
      const orderClause = generateOrderClause(seq, orderCriteria, findById);
      queryText = queryText.replace(seq.placeholder, orderClause);
    } else if (seq.type === 'filter') {
      let filterClause = generateFilterClause(seq, filterCriteria, searchCriteria, isOr, cursor, offsetRequired, cursorOrder, queryValues);
      queryText = queryText.replace(seq.placeholder, filterClause);
    }
  });

  //LIMIT clause appended at the end
  if (findById == 'true') {
    const offset = (pageNo - 1) * pageSize;
    queryText += `;`;
  } else  if (offsetRequired) {
    const offset = (pageNo - 1) * pageSize;
    queryText += ` LIMIT ${pageSize} OFFSET ${offset};`;
  } else if (cursor) {
    queryText += ` LIMIT ${pageSize};`;
  } else {
    invalidRequestError({ moduleName: 'generateDynamicSQL', message: 'Cursor is null' });
  }

  return { text: queryText, values: queryValues };
}

module.exports.generateDFCount = (sqlOptions) => {
  let {
    selectClause, generateSeq = [],
    orderCriteria = [],
    filterCriteria = [],
    searchCriteria = [],
    isOr = false,
    pageNo = 1,
    pageSize = process.env.DEFAULT_PAGE_SIZE || 10,
    cursor
  } = sqlOptions;

  let offsetRequired = true;
  if ((cursor && orderCriteria.length === 0) || (cursor && orderCriteria[0]?.logicalName === 'cursor')) {
    offsetRequired = false;
  }

  let cursorOrder = orderCriteria.find(elem => elem.logicalName === 'cursor')?.value || 'DESC';

  let queryText = selectClause;
  const queryValues = [];

  generateSeq.forEach((seq) => {
    if (seq.type === 'filter') {
      let filterClause = generateFilterClause(seq, filterCriteria, searchCriteria, isOr, cursor, offsetRequired, cursorOrder, queryValues);
      queryText = queryText.replace(seq.placeholder, filterClause);
    }
  });

  return { text: queryText, values: queryValues };
}

module.exports.convertToPlainSQL = (sqlObject) => {
  if (!sqlObject || !sqlObject.text || !sqlObject.values || !Array.isArray(sqlObject.values)) {
    return '';
  }

  const text = sqlObject.text;
  const values = sqlObject.values;
  const sql = text.replace(/\$(\d+)/g, (match, number) => {
    const index = parseInt(number, 10) - 1;
    const value = values[index];

    if (Array.isArray(value)) {
      const formattedArray = value.map(item => {
        return typeof item === 'string' ? `'${item.replace(/'/g, "''")}'` : item;
      }).join(', '); // Join array elements
      return `ARRAY[${formattedArray}]`;
    }

    return typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
  });

  return sql;
}

function generateOrderClause(orderOption, orderCriteria, findById) {
  // console.log('orderOption>>>>> ', orderOption);
  let { defaultSQL = '', allowedOrderColumns = [] } = orderOption;
  
  // console.log('findById>>>>> ', findById);
  if(findById == 'true') {
    return '';
  }

  // console.log('orderCriteria>>>>> ', orderCriteria);
  if (orderCriteria.length === 0) {
    return defaultSQL;
  }

  // console.log('allowedOrderColumns>>>>> ', allowedOrderColumns);
  defaultSQL = '';

  for (let i = 0; i < orderCriteria.length; i++) {
    const criteria = orderCriteria[i];
    const { logicalName, value, condition = '' } = criteria;
    const allowedColumns = allowedOrderColumns.filter(col => col.logicalName === logicalName);
    if (allowedColumns.length === 0) {
      continue;
    }

    for (let i = 0; i < allowedColumns.length; i++) {
      const { table, alias, column, defaultValue } = allowedColumns[i];
      let orderValue = value || defaultValue;

      if (!defaultSQL) {
        defaultSQL = `ORDER BY`;
      } else {
        defaultSQL += ',';
      }

      let columnStr = ``;
      if (alias) {
        columnStr = `${alias}.${column}`;
      } else if (table) {
        columnStr= `${table}.${column}`;
      } else {
        columnStr = `${column}`;
      }

      if(condition.toLowerCase() === 'length') {
        defaultSQL += ` LENGTH(${columnStr}) ${orderValue}`;
      } else {
        defaultSQL += ` ${columnStr} ${orderValue}`;
      }

    }
  }
  return defaultSQL;
}

function generateFilterClause(filterOption, filterCriteria, searchCriteria, isOr, cursor, offsetRequired, cursorOrder, queryValues) {
  // generate filter clause
  let { defaultSQL = '', allowedFilterCols = [], allowedSearchCols = [], cursorCol = {} } = filterOption;

  //add active clause with true if defaultSql = '' and filterCriteria has no activeColumn
  if (!defaultSQL) {
    const filterAtiveColumn = filterCriteria.find(elem => elem.logicalName === 'activeColumn');
    const allowedActiveColumn = allowedFilterCols.find(elem => elem.logicalName === 'activeColumn') || {};
    const{alias, table, column, defaultValue, modifier} = allowedActiveColumn;
    
    if (!filterAtiveColumn && (alias && column && defaultValue)) {
      if (alias) {
        defaultSQL += `${!defaultSQL ? 'WHERE' : ' AND'} ${getModifiedColumnName(modifier, alias, table, column)} = ${defaultValue}`;
      } else if (table) {
        defaultSQL += `${!defaultSQL ? 'WHERE' : ' AND'} ${getModifiedColumnName(modifier, alias, table, column)} = ${defaultValue}`;
      } else {
        defaultSQL += `${!defaultSQL ? 'WHERE' : ' AND'} ${getModifiedColumnName(modifier, alias, table, column)} = ${defaultValue}`;
      }
    }
  }

  // console.log('allowedFilterCols>>>>> ', allowedFilterCols);
  // console.log('allowedSearchCols>>>>> ', allowedSearchCols);
  // console.log('filterCriteria>>>>> ', filterCriteria);


  // generate cursor clause
  let allowedCursorCol = allowedFilterCols.find(elem => elem.logicalName === 'cursor');
  if (!offsetRequired && allowedCursorCol) {
    // console.log('>>>>> INSIDE CURSOR');
    const { table, alias, column, defaultOperator, defaultValue, condition = 'AND', modifier } = allowedCursorCol;
    let filterOperator = cursorOrder === 'ASC' ? '>' : '<';
    queryValues.push(cursor);

    if (alias) {
      defaultSQL += `${!defaultSQL ? 'WHERE' : ' ' + condition} ${getModifiedColumnName(modifier, alias, table, column)} ${filterOperator} $${queryValues.length}`;
    } else if (table) {
      defaultSQL += `${!defaultSQL ? 'WHERE' : ' ' + condition} ${getModifiedColumnName(modifier, alias, table, column)} ${filterOperator} $${queryValues.length}`;
    } else {
      defaultSQL += `${!defaultSQL ? 'WHERE' : ' ' + condition} ${getModifiedColumnName(modifier, alias, table, column)} ${filterOperator} $${queryValues.length}`;
    }
  }

  if (filterCriteria.length === 0 && Object.keys(searchCriteria).length === 0) {
    // console.log('>>>>> INSIDE NO FILTER');
    return defaultSQL;
  }

  for (let i = 0; i < filterCriteria.length; i++) {
    const criteria = filterCriteria[i];
    const { logicalName, operator, value } = criteria;

    const allowedColumns = allowedFilterCols.filter(col => col.logicalName === logicalName);
    if (allowedColumns.length === 0) {
      // console.log('>>>>> INSIDE NO ALLOWED COLUMNS');
      continue;
    }

    for (let i = 0; i < allowedColumns.length; i++) {
      const { table, alias, column, defaultOperator, defaultValue, condition = 'AND', dataType, modifier } = allowedColumns[i];

      let filterValues = value || defaultValue;
      let filterOperator = operator || defaultOperator;

      if(!Array.isArray(filterValues) && dataType == 'int'){  
        filterValues = parseInt(filterValues, 10);
        if(isNaN(filterValues)){
          invalidRequestError({ moduleName: 'generateDynamicSQL', message: 'Filter value is not valid' });
        }
      }

      if(!Array.isArray(filterValues) && dataType == 'boolean'){
        filterValues = filterValues == 'true' || filterValues == true ? true : false;
      }

      if (typeof filterValues != 'boolean' && filterValues.length === 0) {
        continue;
      }

      if ((typeof filterValues != 'boolean' && !filterValues && (filterValues !== 0 || filterValues !== '0'))) {
        continue;
      }

      //continue if filtervalue is an array with length 1 and value '0'
      if (Array.isArray(filterValues) && filterValues.length === 1 && filterValues[0] === '0') {
        continue;
      }

      queryValues.push(filterValues);
      let filterKey = Array.isArray(filterValues) ? `ANY($${queryValues.length})` : `$${queryValues.length}`;

      if (alias) {
        defaultSQL += `${!defaultSQL ? 'WHERE' : ' ' + condition} ${getModifiedColumnName(modifier, alias, table, column)} ${filterOperator} ${filterKey}`;
      } else if (table) {
        defaultSQL += `${!defaultSQL ? 'WHERE' : ' ' + condition} ${getModifiedColumnName(modifier, alias, table, column)} ${filterOperator} ${filterKey}`;
      } else {
        defaultSQL += `${!defaultSQL ? 'WHERE' : ' ' + condition} ${getModifiedColumnName(modifier, alias, table, column)} ${filterOperator} ${filterKey}`;
      }
    }
  }

  // generate search clause
  const searchClause = generateSearchClause(allowedSearchCols, searchCriteria, isOr, queryValues);
  if (!searchClause) {
    return defaultSQL;
  }

  if (!defaultSQL) {
    defaultSQL = `WHERE ${searchClause}`;
  } else {
    defaultSQL += ` AND ${searchClause}`;
  }


  return defaultSQL;
}

function generateSearchClause(allowedSearchCols, searchCriteria, isOr, queryValues) {
  const { searchTerms = [], searchColumns = [] } = searchCriteria;
  let searchClause = '';

  if (searchColumns.length === 0) {
    for (let i = 0; i < allowedSearchCols.length; i++) {
      const { table, alias, column, defaultOperator, defaultValue, condition = 'AND', modifier } = allowedSearchCols[i];

      for (let j = 0; j < searchTerms.length; j++) {
        let filterValue = escapeForLikeOperator(searchTerms[j]) || escapeForLikeOperator(defaultValue);
        let filterOperator = defaultOperator;

        if (filterValue === null || filterValue === undefined || filterValue === '') {
          continue;
        }

        queryValues.push(`%${filterValue}%`);

        if (i === 0 && j === 0) {
          searchClause += `(`
        } else {
          searchClause += ` OR`;
        }

        if (alias) {
          searchClause += ` (${getModifiedColumnName(modifier, alias, table, column)} ${filterOperator} $${queryValues.length})`;
        } else if (table) {
          searchClause += ` (${getModifiedColumnName(modifier, alias, table, column)} ${filterOperator} $${queryValues.length})`;
        } else {
          searchClause += ` (${getModifiedColumnName(modifier, alias, table, column)} ${filterOperator} $${queryValues.length})`;
        }

      }

      if (i === allowedSearchCols.length - 1 && searchClause) {
        searchClause += `)`;
      }
    }
  }

  return searchClause;
}

function getModifiedColumnName(modifier, alias, table, column) {
  if(modifier) {
    return modifier;
  }

  if (alias) {
    return `${alias}.${column}`;
  } else if (table) {
    return `${table}.${column}`;
  } else {
    return `${column}`;
  }
}

function escapeForLikeOperator(str) {
  let escapedString = '';
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '%' || str[i] === '_') {
      escapedString += '\\' + str[i];
    } else {
      escapedString += str[i];
    }
  }
  return escapedString;
}