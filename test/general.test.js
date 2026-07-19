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

global.Swal = { fire: (obj) => { global.lastErrorMsg = obj.html; } };
global.Identity = { errorTitle: "error", okButtonText: "ok" };
global.PenpaText = { get: (key) => key };
global.lastErrorMsg = null;


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
test("request_shortlink functionality", async () => {
    // Save original global.$
    const originalDollar = global.$;

    try {
        // Mock successful $.get
        global.$ = {
            get: (url, callback) => {
                if (url.includes("success")) {
                    return Promise.resolve(callback("https://tinyurl.com/success", "success"));
                } else if (url.includes("error")) {
                    return Promise.resolve(callback(null, "error"));
                } else if (url.includes("reject")) {
                    return Promise.reject(new Error("Network error"));
                }
            }
        };

        // Test successful link creation
        const successLink = await general.request_shortlink("http://example.com/success#hash");
        assert.equal(successLink, "https://tinyurl.com/success");

        // Test link creation failure (status != "success")
        const errorLink = await general.request_shortlink("http://example.com/error");
        assert.equal(errorLink, null);

        // Test promise rejection
        const rejectLink = await general.request_shortlink("http://example.com/reject");
        assert.equal(rejectLink, null);

    } finally {
        // Restore original global.$
        global.$ = originalDollar;
    }
});

test("get_download_filename functionality", () => {
    // Save original global.document
    const originalDocument = global.document;

    try {
        // We will modify these in our tests
        let elements = {
            "testInputID": { value: "" },
            "saveinfotitle": { value: "" },
            "saveinfoauthor": { value: "" }
        };

        global.document = {
            getElementById: (id) => elements[id]
        };

        // Test 1: Valid filename provided in input
        elements["testInputID"].value = "my_custom_filename";
        assert.equal(general.get_download_filename("testInputID"), "my_custom_filename");

        // Test 2: Empty input, generates default name without bad characters
        elements["testInputID"].value = "";
        elements["saveinfotitle"].value = "My Puzzle Title";
        elements["saveinfoauthor"].value = "Puzzle Author";
        assert.equal(general.get_download_filename("testInputID"), "penpa-Puzzle-Author-My-Puzzle-Title");

        // Test 3: Empty input, sanitizes bad characters
        elements["testInputID"].value = "";
        elements["saveinfotitle"].value = "Title with <bad> chars | and * symbols?";
        elements["saveinfoauthor"].value = "Author / Name \\";
        assert.equal(general.get_download_filename("testInputID"), "penpa-Author-Name-Title-with-bad-chars-and-symbols-");

    } finally {
        // Restore original global.document
        global.document = originalDocument;
    }
test("validate_filename functionality", () => {
    // Reset global state
    global.lastErrorMsg = null;

    // Valid filename without extension
    const result1 = general.validate_filename("valid_name", "txt");
    assert.equal(result1, "valid_name.txt");
    assert.equal(global.lastErrorMsg, null);

    // Valid filename with extension already
    const result2 = general.validate_filename("valid_name.txt", "txt");
    assert.equal(result2, "valid_name.txt");
    assert.equal(global.lastErrorMsg, null);

    // Invalid filename with bad chars
    const result3 = general.validate_filename("bad/name", "txt");
    assert.equal(result3, null);
    assert.equal(global.lastErrorMsg, "unsupported_filename");
});
