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

test("update_textarea functionality", async () => {
    // Setup globals
    const originalUserSettings = global.UserSettings;
    const originalDocument = global.document;
    const originalPu = global.pu;
    const originalDollar = global.$;

    try {
        global.UserSettings = { shorten_links: false };
        const mockTextarea = { value: "" };
        global.document = {
            getElementById: (id) => {
                if (id === "savetextarea") return mockTextarea;
                return null;
            }
        };
        global.pu = { isReplay: false };

        // Test 1: shorten_links is false
        await general.update_textarea("original_text");
        assert.equal(mockTextarea.value, "original_text");

        // Mock $.get
        global.$ = {
            get: (url, callback) => {
                if (url.includes("success")) {
                    const link = "https://tinyurl.com/success";
                    callback(link, "success");
                    return Promise.resolve(link);
                } else if (url.includes("fail")) {
                    return Promise.reject(new Error("Network fail"));
                } else {
                    callback(null, "error");
                    return Promise.resolve(null);
                }
            }
        };

        // Test 2: shorten_links is true, shortlink succeeds
        global.UserSettings.shorten_links = true;
        await general.update_textarea("http://example.com/success");
        assert.equal(mockTextarea.value, "https://tinyurl.com/success");

        // Test 3: shorten_links is true, shortlink fails (resolves null)
        await general.update_textarea("http://example.com/error");
        assert.equal(mockTextarea.value, "http://example.com/error");

        // Test 4: shorten_links is true, shortlink succeeds, pu.isReplay is true
        global.pu.isReplay = true;
        await general.update_textarea("http://example.com/success");
        assert.equal(mockTextarea.value, "https://tinyurl.com/success#Replay");
        assert.equal(global.pu.isReplay, false);

        // Test 5: shorten_links is true, shortlink exception (mock fail)
        await general.update_textarea("http://example.com/fail");
        assert.equal(mockTextarea.value, "http://example.com/fail");

    } finally {
        global.UserSettings = originalUserSettings;
        global.document = originalDocument;
        global.pu = originalPu;
        global.$ = originalDollar;
    }
});
