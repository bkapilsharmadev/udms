const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Generate a hash of a file
 * @param {string} filePath - Path to the file
 * @param {string} algorithm - Hashing algorithm (default: sha256)
 * @returns {Promise<string>} - The file hash
 */
function generateFileHash(filePath, algorithm = "sha256") {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(filePath);

        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", (err) => reject(err));
    });
}

module.exports = {
    generateFileHash
}