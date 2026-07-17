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
