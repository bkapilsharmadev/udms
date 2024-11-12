const { body, check } = require('express-validator');
const { validationHandler } = require('./validation.handler');


// if orgTypeLid is 5(Supplier) then serviceTypeLid is required
const validateServiceType = (value, { req }) => {
    const errors = [];
    if (value.orgTypeLid == 5 && !value.serviceTypeLid) {
        return false;
    }

    return true;
};

// validate duplicate tradeName and legalName
const checkDuplicateTradeLegalName = (value, { req }) => {
    const uniqueTradeNames = new Set();
    const uniqueLegalNames = new Set();

    for (const item of value) {
        const tradeNameKey = item.tradeName;
        const legalNameKey = item.legalName;

        if (uniqueTradeNames.has(tradeNameKey) || uniqueLegalNames.has(legalNameKey)) {
            return false;
        }

        uniqueTradeNames.add(tradeNameKey);
        uniqueLegalNames.add(legalNameKey);
    }

    return true;
};

//check if value is an integer
const isCustInt = (value) => {
    if (value.serviceTypeLid && isNaN(value.serviceTypeLid)) {
        return false;
    }
    return true;
};

// validate time format
const isValidTimeFormat = (value) => {
    if (typeof value !== 'string') {
        return false; // If input is not a string, it's not a valid time
    }

    const timeComponents = value.split(':');
    if (timeComponents.length < 2 || timeComponents.length > 3) {
        return false; // If time doesn't have two components (hours and minutes), it's invalid
    }

    const hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1], 10);

    if (isNaN(hours) || isNaN(minutes)) {
        return false; // If hours or minutes are not numbers, time is not valid
    }

    // Check if hours and minutes are within valid ranges
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return false;
    }

    return true;
}

function isNumber(input) {
    // Check if input is empty
    if (input === "") {
        return true;
    }

    if (parseInt(input, 10) != input) {
        return false;
    }
    return true;
}

function isAlphabet(input) {
    if (!input || input.trim() === '') {
        return false;
    }

    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i);
        if (
            !(charCode === 32 || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122))
        ) {
            return false;
        }
    }
    return true;
}

// validate pan number
const validatePanNumber = (value) => {
    
    if (value.length !== 10) {
        return false;
    }

    for (let i = 0; i < value.length; i++) {
        if (i <= 4 && !isAlphabet(value[i])) {
            return false;
        }

        if (i > 4 && i < 9 && !isNumber(value[i])) {
            return false;
        }

        if (i === 9 && !isAlphabet(value[i])) {
            return false;
        }
    }

    return true;
}

// Custom validator to check if an object is empty
const isEmptyObject = (value) => {
    return value && typeof value === 'object' && Object.keys(value).length > 0;
};

// if tax type is 5 (SEZ) then tax document is required and should be a valid file format
const validateDocument = (value, { req }) => {
  const file = req?.files?.taxDocument || req?.files?.bankRelatedDoc;
  const parsed = req?.body?.parsedInsertData;
console.log("file >>>", file);

  if (parsed[0].taxTypeLid == 5 && !file) {
    console.log("file not found");
    return false;
  }

  if (parsed[0].taxTypeLid == 5 && typeof file === 'object') {
 
    let fileName = file?.name;
    console.log("fileName >>>", fileName);
    if (typeof fileName !== 'string') {
        return false; // If input is not a string, it's not a valid time
    }   
    
    const fileComponents = fileName.split('.');
    console.log("fileComponents >>>", fileComponents);
    if (fileComponents.length !== 2) {
        console.log("fileComponents length >>>", fileComponents.length);
        return false; // If file doesn't have two components (path and extension), it's invalid
    }
  
    const extension = fileComponents[1];
    console.log("extension >>>", extension);
    if (extension !== 'pdf' && extension !== 'jpg' && extension !== 'gif' && extension !== 'jpeg' && extension !== 'png') {
        return false;
    }
  }

  return true;
}

// check alphanumeric validation 
function isAlphanumeric(str) {
    let hasNumber = false;
    let hasLetter = false;

    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);

        if (charCode >= 48 && charCode <= 57) { // 0-9
            hasNumber = true;
        } else if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) { // A-Z or a-z
            hasLetter = true;
        }

        // If both a number and a letter are found, return true
        if (hasNumber && hasLetter) {
            return true;
        }
    }

    // If loop completes without finding both a number and a letter, return false
    return false;
}


// validate org insert
module.exports.validateInsertOrg = [
    check('insertData', 'No data to be inserted.')
        .notEmpty()
        .bail()
        .isArray({ min: 1 })
        .withMessage('insertData should be an array with min 1 item')
        .bail()
        .custom(checkDuplicateTradeLegalName) // Custom validation
        .withMessage('Duplicate tradeName and legalName found'),

    check('insertData.*.orgTypeLid', 'orgTypeLid is required')
        .notEmpty()
        .bail()
        .isInt(),

    check('insertData.*.serviceTypeLid')
        .custom(validateServiceType) // Custom validation
        .withMessage('serviceTypeLid is required for Supplier')
        .bail() // Stops validation chain if custom validation fails
        .custom(isCustInt) // Custom validation
        .withMessage('serviceTypeLid should be an integer'),

    check('insertData.*.tradeName', 'tradeName is required')
        .notEmpty()
        .bail()
        .isString({ min: 2, max: 255 })
        .withMessage('tradeName should be a string with min 2 and max 255 characters'),

    check('insertData.*.orgEntityLid', 'orgEntityLid is required')
        .notEmpty()
        .bail()
        .isInt()
        .withMessage('orgEntityLid should be an integer'),

    check('insertData.*.orgTypeLid', 'orgTypeLid should be an integer')
        .notEmpty()
        .bail()
        .isInt()
        .withMessage('orgTypeLid should be an integer'),

    check('insertData.*.orgIndustryLid', 'orgIndustryLid is required')
        .notEmpty()
        .bail()
        .isInt()
        .withMessage('orgIndustryLid should be an integer'),

    check('insertData.*.parentOrgLid', 'parentOrgLid should be an integer')
        .optional({ checkFalsy: true }) // Optional with falsy values allowed
        .isInt()
        .withMessage('parentOrgLid should be an integer'),

    check('insertData.*.orgGroupLid', 'orgGroupLid should be an integer')
        .optional({ checkFalsy: true }) // Optional with falsy values allowed
        .isInt()
        .withMessage('orgGroupLid should be an integer'),

    check('insertData.*.isMsme', 'isMsme should be a boolean')
        .optional()
        .isBoolean(),

    check('insertData.*.is24Hours', 'is24Hours should be a boolean')
        .optional()
        .isBoolean(),

    check('insertData.*.openingTime', 'openingTime should be a valid time')
        .optional({ checkFalsy: true }) // Optional with falsy values allowed
        .custom(isValidTimeFormat),

    // '07:00' is a valid time
    check('insertData.*.closingTime', 'closingTime should be a valid time')
        .optional({ checkFalsy: true }) // Optional with falsy values allowed
        .custom(isValidTimeFormat),

    check('insertData.*.panNumber')
        .custom(validatePanNumber) // Custom validation
        .withMessage('panNumber is required')
        .bail() // Stops validation chain if custom validation fails
        .isLength({ min: 10, max: 10 })
        .withMessage('panNumber should be an String'),

    validationHandler // Handler for validation errors
];

module.exports.validateUpdateOrg = [
    check('updateData', 'No data to be inserted.')
        .notEmpty()
        .bail()
        .isArray({ min: 1 })
        .withMessage('updateData should be an array with min 1 item')
        .bail()
        .custom(checkDuplicateTradeLegalName) // Custom validation
        .withMessage('Duplicate tradeName and legalName found'),

    check('updateData.*.orgLid', 'orgLid is required')
        .notEmpty()
        .bail()
        .isInt(),

    check('updateData.*.tradeName', 'tradeName is required')
        .notEmpty()
        .bail()
        .isString({ min: 2, max: 255 })
        .withMessage('tradeName should be a string with min 2 and max 255 characters'),

    check('updateData.*.orgIndustryLid', 'orgIndustryLid is required')
        .notEmpty()
        .bail()
        .isInt()
        .withMessage('orgIndustryLid should be an integer'),

    check('updateData.*.isMsme', 'isMsme should be a boolean')
        .optional()
        .isBoolean(),

    check('updateData.*.is24Hours', 'is24Hours should be a boolean')
        .optional()
        .isBoolean(),

    check('updateData.*.orgEntityLid', 'orgEntityLid is required')
        .notEmpty()
        .bail()
        .isInt()
        .withMessage('orgEntityLid should be an integer'),

    check('updateData.*.openingTime', 'openingTime should be a valid time')
        .optional({ checkFalsy: true }) // Optional with falsy values allowed
        .custom(isValidTimeFormat),

    // '07:00' is a valid time
    check('updateData.*.closingTime', 'closingTime should be a valid time')
        .optional({ checkFalsy: true }) // Optional with falsy values allowed
        .custom(isValidTimeFormat),
        
    check('updateData.*.panNumber')
        .custom(validatePanNumber) // Custom validation
        .withMessage('panNumber is required')
        .bail() // Stops validation chain if custom validation fails
        .isLength({ min: 10, max: 10 })
        .withMessage('panNumber should be an String'),

    validationHandler // Handler for validation errors
];

module.exports.validateDelOrg = [
    check('orgId')
        .notEmpty().withMessage('orgId is required')
        .bail()
        .isInt().withMessage('orgId must be an integer'),

    validationHandler
]

// validate organization branch
module.exports.validateInsertOrgBranch = [
    body('insertData.orgLid')
        .notEmpty().withMessage('orgLid is required')
        .isInt().withMessage('orgLid must be an integer'),
    body('insertData.branchName')
        .notEmpty().withMessage('branchName is required')
        .isString().withMessage('branchName must be a string'),
    body('insertData.branchCode')
        .optional()
        .notEmpty().withMessage('branchCode is required')
        .isString().withMessage('branchCode must be a string'),
    body('insertData.branchLutNum')
        .optional()
        .notEmpty().withMessage('branchLutNum is required')
        .isString().withMessage('branchLutNum must be a string'),
    body('insertData.serviceCityLid')
        .optional()
        .notEmpty().withMessage('serviceCityLid is required')
        .isInt().withMessage('serviceCityLid must be an integer'),
    body('insertData.financialYearLid')
        .optional()
        .notEmpty().withMessage('financialYearLid is required')
        .isInt().withMessage('financialYearLid must be an integer'),
    body('insertData.parentBranchLid')
        .optional({ nullable: true, checkFalsy: true })  // Optional with falsy values allowed
        .isInt().withMessage('parentBranchLid must be an integer if provided'),

    validationHandler
];

module.exports.validateUpdateOrgBranch = [
    body('updateData.orgLid')
        .notEmpty().withMessage('orgLid is required')
        .isInt().withMessage('orgLid must be an integer'),
    body('updateData.branchName')
        .isString().withMessage('branchName must be a string')
        .notEmpty().withMessage('branchName is required'),
    body('updateData.branchCode')
        .optional()
        .isString().withMessage('branchCode must be a string')
        .notEmpty().withMessage('branchCode is required'),
    body('updateData.branchLutNum')
        .optional()
        .isString().withMessage('branchLutNum must be a string')
        .notEmpty().withMessage('branchLutNum is required'),
    body('updateData.serviceCityLid')
        .optional()
        .isInt().withMessage('serviceCityLid must be an integer')
        .notEmpty().withMessage('serviceCityLid is required'),
    body('updateData.financialYearLid')
        .optional()
        .isInt().withMessage('financialYearLid must be an integer')
        .notEmpty().withMessage('financialYearLid is required'),
    body('updateData.parentBranchLid')
        .optional({ nullable: true, checkFalsy: true }) // Optional with falsy values allowed
        .isInt().withMessage('parentBranchLid must be an integer if provided'),

    validationHandler
];

module.exports.validateDelBranch = [
    check('branchLid')
        .notEmpty().withMessage('branchLid is required')
        .bail()
        .isInt().withMessage('branchLid must be an integer'),

    check('orgLid')
        .notEmpty().withMessage('branchLid is required')
        .bail()
        .isInt().withMessage('branchLid must be an integer'),

    validationHandler
];

// validate organization tax
module.exports.validateInsertOrgTax = [
    check('orgTaxJsonData')
        .notEmpty()
        .withMessage('orgTaxJsonData is required')
        .bail()
        .custom((value) => {
            try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed.insertData) || parsed.insertData.length < 1) {
                    throw new Error('insertData should be an array with at least one item');
                }
                return true;
            } catch (e) {
                throw new Error('Invalid JSON format in orgTaxJsonData');
            }
        }),
  
    // Check each field in insertData array
    check('orgTaxJsonData').custom((value, { req }) => {
        const parsed = JSON.parse(value);
        req.body.parsedInsertData = parsed.insertData; // Store parsed data in request for further validation
        return true;
    }),
  
    check('parsedInsertData.*.orgLid', 'orgLid is required')
        .notEmpty()
        .bail()
        .isInt()
        .withMessage('orgLid should be an integer'),
  
    check('parsedInsertData.*.branch', 'branch is required')
        .notEmpty()
        .bail()
        .isString()
        .withMessage('branch should be a string'),
  
    check('parsedInsertData.*.branchLid')
        .isInt()
        .withMessage('branchLid should be an integer'),
  
    check('parsedInsertData.*.taxTypeLid')
        .isInt()
        .withMessage('taxTypeLid should be an integer'),
  
    check('parsedInsertData.*.taxNumber', 'taxNumber is required')
        .notEmpty()
        .bail()
        .custom( value =>  isAlphanumeric(value))
        .withMessage('taxNumber should be alphanumeric'),
  
    check('parsedInsertData.*.taxPercentage', 'taxPercentage is required')
        .notEmpty()
        .bail()
        .isFloat({ min: 0, max: 100 })
        .withMessage('taxPercentage should be a number between 0 and 100'),
  
    check('taxDocument')
        .custom(validateDocument)
        .withMessage('taxDocument is required and should be a valid file format'),

    validationHandler
];

module.exports.validateDelOrgTax = [
    check('taxLid')
        .notEmpty().withMessage('taxLid is required')
        .bail()
        .isInt().withMessage('taxLid must be an integer'),

    validationHandler
]

// {
//     "insertData": {
//         "orgLid": "34",
//         "bankAccountBranchId": null,
//         "bankAccountTypeLid": null,
//         "bankAccountName": "",
//         "bankAccountNumber": "",
//         "bankAccountIFSCCode": ""
//     }
// }

module.exports.validateInsertBank = [
    check('orgBankAccountJsonData')
        .notEmpty()
        .withMessage('orgBankAccountJsonData is required')
        .bail()
        .custom((value) => {
            try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed.insertData) || parsed.insertData.length < 1) {
                    throw new Error('insertData should be an array with at least one item');
                }
                return true;
            } catch (e) {
                throw new Error('Invalid JSON format in orgBankAccountJsonData');
            }
        }),
  
    // Check each field in insertData array
    check('orgBankAccountJsonData').custom((value, { req }) => {
        const parsed = JSON.parse(value);
        req.body.parsedInsertData = parsed.insertData; // Store parsed data in request for further validation
        return true;
    }),
  
    check('parsedInsertData.*.orgLid', 'orgLid is required')
        .notEmpty()
        .bail()
        .isInt()
        .withMessage('orgLid should be an integer'),

    check('parsedInsertData.*.bankAccountBranchId')
        .notEmpty()
        .isInt()
        .withMessage('bankAccountBranchId should be an integer'),
    
    check('parsedInsertData.*.bankAccountTypeLid')
        .notEmpty()
        .isInt()
        .withMessage('bankAccountTypeLid should be an integer'),
        
    check('parsedInsertData.*.bankAccountName', 'branch is required')
        .notEmpty()
        .bail()
        .isString()
        .withMessage('bankAccountName should be a string'),
  
    check('parsedInsertData.*.bankAccountNumber', 'bankAccountNumber is required')
        .notEmpty()
        .bail()
        .isString()
        .withMessage('bankAccountNumber should be string'),

    check('parsedInsertData.*.bankAccountIFSCCode', 'bankAccountIFSCCode is required')
        .notEmpty()
        .bail()
        .isString()
        .withMessage('bankAccountIFSCCode should be string'),
  
    check('bankRelatedDoc')
        .custom(validateDocument)
        .withMessage('bankRelatedDoc is required and should be a valid file format'),

    validationHandler
];
