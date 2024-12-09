
module.exports.COOKIE_OPTIONS = {
    signed: true,
    secure: false,
    httpOnly: true,
    sameSite: 'strict'
};

//age: 30 days
module.exports.COOKIE_OPTIONS_PERMANENT = {
    signed: true,
    secure: false,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: process.env.DEVICE_TOKEN_VALIDITY * 24 * 60 * 60 * 1000
};

module.exports.MENTOR_SIGNS = ['NOT REQUIRED', 'YES', 'NO', 'ON LEAVE'];

module.exports.DOCUMENT_CATEGORY_HEADERS = [
    { fieldName: 'Category Name', isRequired: true },
    { fieldName: 'Category Abbreviation', isRequired: true },
    { fieldName: 'Description', isRequired: false },
    { fieldName: 'Parent Category', isRequired: false }
]    