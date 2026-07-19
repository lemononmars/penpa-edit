const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("fs");
const path = require("path");

// Set up globals required by encrypt_data and decrypt_data
global.window = global;
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
global.btoa = (str) => Buffer.from(str, "binary").toString("base64");
global.atob = (str) => Buffer.from(str, "base64").toString("binary");

// Create a context and run Zlib script to attach Zlib to global correctly inside require()
const vm = require("vm");
const context = vm.createContext(global);
const zlibSource = fs.readFileSync(path.join(__dirname, "../docs/js/libs/zlib.js"), "utf8");
vm.runInContext(zlibSource, context);

const general = require("../docs/js/general.js");

test("isEmpty functionality", () => {
    // Edge cases
    assert.equal(general.isEmpty(null), true);
    assert.equal(general.isEmpty(undefined), true);

    // Objects
    assert.equal(general.isEmpty({}), true);
    assert.equal(general.isEmpty({ a: 1 }), false);

    // Arrays
    assert.equal(general.isEmpty([]), true);
    assert.equal(general.isEmpty([1, 2]), false);

    // Strings
    assert.equal(general.isEmpty(""), true);
    assert.equal(general.isEmpty("hello"), false);
});

test("encrypt_data and decrypt_data functionality", () => {
    const testCases = [
        "Hello World",
        "",
        "1234567890",
        "A string with special characters !@#$%^&*()",
        "A very long string ".repeat(100),
        "Unicode characters: 🌟 漢字", // TextEncoder/Decoder should handle this
    ];

    for (const testCase of testCases) {
        const encrypted = general.encrypt_data(testCase);
        const decrypted = general.decrypt_data(encrypted);

        assert.equal(typeof encrypted, "string", "Encrypted data should be a string");
        assert.notEqual(encrypted, testCase, "Encrypted data should not be the original string (except empty maybe)");
        assert.equal(decrypted, testCase, `Decrypted data should match original for: ${testCase.substring(0, 20)}`);
    }
});
