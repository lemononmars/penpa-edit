const assert = require("node:assert/strict");
const test = require("node:test");
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
