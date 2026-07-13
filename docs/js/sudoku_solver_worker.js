/* CSP analysis worker: keeps recursive search off the UI thread. */
importScripts("./sudoku_csp.js");

self.onmessage = async function(event) {
    if (!event.data || event.data.type !== "analyze") return;
    try {
        var result = await SudokuCSP.getCandidatesAsync(
            event.data.board,
            event.data.constraints,
            {
                seedSolutions: event.data.seedSolutions || [],
                onProgress: function(progress) {
                    self.postMessage({ type: "progress", progress: progress });
                }
            }
        );
        self.postMessage({ type: "result", result: result });
    } catch (error) {
        self.postMessage({
            type: "error",
            message: error && error.message ? error.message : String(error)
        });
    }
};
