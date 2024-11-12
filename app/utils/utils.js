const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

module.exports.checkKeysAndValues = (obj, keysArray) => {
    return keysArray.every(key => obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined && obj[key] !== '');
}

module.exports.generateOTP = () => {
    const otp = Math.floor(Math.random() * 900000) + 100000;
    return otp;
}

module.exports.isValidJson = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports.isNumber = (input) => {
    if (!input || input === '') {
        return false;
    }

    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i);
        if (charCode < 48 || charCode > 57) {
            return false;
        }
    }
    return true;
};

module.exports.isAlphabet = (input) => {
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
};

module.exports.isAlphabeticWords = (input) => {
    if (!input || input.trim() === '') {
        return false;
    }

    const words = input.split(' ');

    for (const word of words) {
        for (let i = 0; i < word.length; i++) {
            const charCode = word.charCodeAt(i);
            if ((charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
                return false;
            }
        }
    }

    return true;
};

module.exports.isAlphaNumeric = (input) => {
    if (!input || input === '') {
        return false;
    }

    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i);
        if (
            (charCode < 48 || charCode > 57) && // Numeric characters
            (charCode < 65 || charCode > 90) && // Uppercase letters
            (charCode < 97 || charCode > 122)   // Lowercase letters
        ) {
            return false;
        }
    }
    return true;
};

module.exports.isEmail = (input) => {
    if (!input || input === '') {
        return false;
    }

    // Check for a valid format
    if (input.indexOf('@') === -1) {
        return false;
    }

    const parts = input.split('@');
    if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
        return false;
    }

    // Check the domain part
    const domainParts = parts[1].split('.');
    if (domainParts.length < 2) {
        return false;
    }
    for (const part of domainParts) {
        if (part.length === 0) {
            return false;
        }
    }

    return true;
};

module.exports.isMobile = (input) => {
    if (this.isExist(input) && this.isNumber(input) && input.length === 10) {
        return true;
    }
    return false;
};

module.exports.isEmpty = (input) => {
    return input === undefined || input === null || input === '';
};

module.exports.isExist = function isExist(input) {
    return !this.isEmpty(input);
};

module.exports.hasSpecialCharacter = (input) => {
    if (!input || input === '') {
        return false;
    }

    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i);
        if (
            (charCode >= 48 && charCode <= 57) || // Numeric characters
            (charCode >= 65 && charCode <= 90) || // Uppercase letters
            (charCode >= 97 && charCode <= 122) || // Lowercase letters
            charCode === 32 // Space
        ) {
            return true;
        }
    }
    return false;
};

module.exports.isLength = (input, minLength, maxLength) => {
    if (isEmpty(input) || isEmpty(minLength) || isEmpty(maxLength)) {
        return false;
    }

    const length = input.trim().length;

    if (minLength == 'min') {
        return length <= maxLength;
    }

    if (maxLength == 'max') {
        return length >= minLength;
    }

    return length >= minLength && length <= maxLength;
};

module.exports.isBetween = (input, min, max) => {
    if (isEmpty(input) || isEmpty(min) || isEmpty(max)) {
        return false;
    }
    // if input is string then convert it to number
    input = parseFloat(input);

    if (min === 'min') {
        return input <= max;
    }

    if (max === 'max') {
        return input >= min;
    }

    return input >= min && input <= max;
};

module.exports.formatPath = (inputString) => {
    const formattedString = inputString.replace(/\s+/g, '-');
    const lowercaseString = formattedString.toLowerCase();
    return lowercaseString;
}


module.exports.buildMenuTree = (menuList) => {
    console.log('>>> WRITING FILE')
    //write in file system in test folder
    //fs.writeFileSync("E:/Projects/autoriders/developemnt/autoriders/test/menu.json", JSON.stringify(menuList, null, 2));


    const menuMap = new Map();
    // Create a map of menu items using their ids
    menuList.forEach(item => {
        menuMap.set(item.id, { ...item, children: [] });
    });

    // Build the tree structure
    const tree = [];
    menuMap.forEach(menuItem => {
        if (menuItem.parent_id === null) {
            // If it's a top-level menu item
            tree.push(menuItem);
        } else {
            // If it has a parent, add it to the parent's children array
            const parent = menuMap.get(menuItem.parent_id);
            if (parent) {
                parent.children.push(menuItem);
            }
        }
    });

    //fs.writeFileSync("E:/Projects/autoriders/developemnt/autoriders/test/tree.json", JSON.stringify(tree, null, 2));


    return tree;
}

module.exports.randomPassword = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$&*';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


module.exports.maskEmail = (email) => {
    let parts = email.split("@");
    let maskedUsername = parts[0][0] + "*".repeat(parts[0].length - 2) + parts[0][parts[0].length - 1];
    let domain = parts[1];
    return maskedUsername + "@" + domain;
}

module.exports.getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const _day = String(date.getDate() - 6).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    const endOfDay = new Date(year, date.getMonth(), day, 23, 59, 59, 999);
    const endYear = endOfDay.getFullYear();
    const endMonth = String(endOfDay.getMonth() + 1).padStart(2, '0');
    const endDay = String(endOfDay.getDate()).padStart(2, '0');
    const endHours = String(endOfDay.getHours()).padStart(2, '0');
    const endMinutes = String(endOfDay.getMinutes()).padStart(2, '0');
    const endSeconds = String(endOfDay.getSeconds()).padStart(2, '0');
    const endMilliseconds = String(endOfDay.getMilliseconds()).padStart(3, '0');

    let obj = {
        requestTime: `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`,
        fromDate: `${year}${month}${_day} ${hours}${minutes}${seconds}${milliseconds}`,
        toDate: `${endYear}${endMonth}${endDay} ${endHours}${endMinutes}${endSeconds}${endMilliseconds}`
    };

    return obj;
}




module.exports.getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const _day = String(date.getDate() - 6).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    const endOfDay = new Date(year, date.getMonth(), day, 23, 59, 59, 999);
    const endYear = endOfDay.getFullYear();
    const endMonth = String(endOfDay.getMonth() + 1).padStart(2, '0');
    const endDay = String(endOfDay.getDate()).padStart(2, '0');
    const endHours = String(endOfDay.getHours()).padStart(2, '0');
    const endMinutes = String(endOfDay.getMinutes()).padStart(2, '0');
    const endSeconds = String(endOfDay.getSeconds()).padStart(2, '0');
    const endMilliseconds = String(endOfDay.getMilliseconds()).padStart(3, '0');

    let obj = {
        requestTime: `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`,
        fromDate: `${year}${month}${_day} ${hours}${minutes}${seconds}${milliseconds}`,
        toDate: `${endYear}${endMonth}${endDay} ${endHours}${endMinutes}${endSeconds}${endMilliseconds}`
    };

    return obj;
}


module.exports.generateOrderNumber = () => {
    const date = new Date();
    // Get date components
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    // Generate a random number between 1000 and 9999
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    // Combine date components and random number to form the order number
    const orderNumber = `${year}${month}${day}${hours}${minutes}${seconds}${randomNum}`;
    return orderNumber;
}

function updateJson(obj, updates) {
    for (let key in updates) {
        if (updates.hasOwnProperty(key)) {
            if (typeof updates[key] === 'object' && updates[key] !== null && obj.hasOwnProperty(key)) {
                updateJson(obj[key], updates[key]);
            } else {
                obj[key] = updates[key];
            }
        }
    }
    return obj;
}
module.exports.slowWriteJsonKeyToFile = (req, filePath) => {
    let data = {};



    // Check if file exists
    try {
        if (fs.existsSync(filePath)) {
            const existingData = fs.readFileSync(filePath, 'utf8');
            data = JSON.parse(existingData);
        }

        const key = req.url;
        if (!data[key]) {
            data[key] = { query: {}, params: {}, body: {} };
        }

        // Merge the existing data with the new input
        //updateJson function recursively parses and adds new keys, preserves old keys too.
        data[key] = updateJson(data[key], { "query": req.query, "params": req.params, "body": req.body });

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    catch (e) {
        console.log(e, "errors in contract router");
    }
}

module.exports.base64_encode = (file)=>{
    try {
        var bitmap = fs.readFileSync(file);
        let img = Buffer.from(bitmap).toString('base64');
        return `data:image/png;base64,${img}`;
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        return null;
    }
}