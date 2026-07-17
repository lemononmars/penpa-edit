const chai_assert = chai.assert;

describe("general.js functions", () => {
    let penpa;

    before(() => {
        penpa = document.getElementById("penpa").contentWindow;
    });

    describe("encrypt_data and decrypt_data", () => {
        const testCases = [
            ["empty string", ""],
            ["standard ascii string", "hello world"],
            ["string with numbers", "1234567890"],
            ["json string", '{"key": "value", "array": [1, 2, 3]}'],
            ["special characters", "!@#$%^&*()_+{}:\"<>?|[];',./`~"],
            ["unicode characters", "こんにちは世界 (Hello World)"],
            ["very long string", "a".repeat(10000)],
            ["complex json", JSON.stringify({
                grid: [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9]
                ],
                settings: {
                    theme: "dark",
                    showErrors: true
                }
            })]
        ];

        for (const [name, data] of testCases) {
            it(name, () => {
                const encrypted = penpa.encrypt_data(data);
                const decrypted = penpa.decrypt_data(encrypted);
                chai_assert.equal(decrypted, data, `Failed to decrypt/encrypt data for: ${name}`);
            });
        }
    });
});
