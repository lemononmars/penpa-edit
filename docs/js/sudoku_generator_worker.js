/* Puzzle generation worker: uniqueness checks never block Penpa's canvas. */
var workerAssetQuery = self.location && self.location.search || "";
function importWorkerAsset(path) {
    var lastError;
    for (var attempt = 0; attempt < 3; attempt++) {
        try {
            var separator = workerAssetQuery ? "&" : "?";
            importScripts(path + workerAssetQuery + (attempt ? separator + "asset_retry=" + attempt + "_" + Date.now() : ""));
            return;
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError;
}
["./sudoku_csp.js", "./sudoku_csp_variants/browser.js", "./sudoku_variants/browser.js", "./sudoku_generator.js"].forEach(importWorkerAsset);

self.onmessage = function(event) {
    if (!event.data || event.data.type !== "generate") return;
    try {
        var result = SudokuGenerator.generate({
            size: event.data.size,
            variant: event.data.variant,
            variants: event.data.variants,
            negative: event.data.negative,
            sourceBoard: event.data.sourceBoard,
            sourceConstraints: event.data.sourceConstraints,
            preserveExisting: event.data.preserveExisting,
            symmetry: event.data.symmetry,
            minimal: event.data.minimal,
            extraClues: event.data.extraClues,
            maxGivens: event.data.maxGivens,
            seed: event.data.seed,
            onProgress: function(progress) {
                self.postMessage({ type: "progress", progress: progress });
            }
        });
        self.postMessage({ type: "result", result: result });
    } catch (error) {
        self.postMessage({ type: "error", message: error && error.message ? error.message : String(error) });
    }
};
