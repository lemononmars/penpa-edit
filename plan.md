1. **Modify `docs/src/VariantCatalogApp.svelte`**:
   - Locate the `<main>` tag.
   - Refactor the markup to use a `.detail-layout` container around `<article class="variant-detail">`.
   - On the right side, inside `.detail-layout`, if an example is available, create an `<aside class="variant-examples">`.
   - Embed two iframes. The first iframe points to `exampleUrl(detailVariation.example, detailVariation.value)`.
   - The second iframe should show the solved state. Since Penpa edit links don't have a simple `#v=solve` flag to pre-solve on load, the easiest way is to add an `on:load` listener to the second iframe that clicks the `#sudoku_solve_once` button using `contentWindow.document`.
     Actually, if `example` URL contains `#m=solve&p=`, it's an unsolved state. By triggering `sudoku_solve_once.click()` after it loads, the user will see the solved version.
   - Wait, `SudokuTools.solveOnceAutoEnabled = true` makes it solve it immediately, but since it's inside an iframe, injecting the script on load like:
     ```svelte
     <iframe
       src={exampleUrl(detailVariation.example, detailVariation.value)}
       title="Solved Example"
       on:load={(e) => {
         const win = e.target.contentWindow;
         if (win && win.SudokuTools) {
           win.SudokuTools.solveOnceAutoEnabled = true;
           const btn = win.document.getElementById('sudoku_solve_once');
           if (btn) btn.click();
         } else if (win) {
           setTimeout(() => {
             if (win.SudokuTools) {
               win.SudokuTools.solveOnceAutoEnabled = true;
               const btn = win.document.getElementById('sudoku_solve_once');
               if (btn) btn.click();
             }
           }, 1000);
         }
       }}
     ></iframe>
     ```
   - Actually, using `setInterval` or `setTimeout` repeatedly (polling) is more robust because `onload` might fire before `SudokuTools` is fully loaded or initialized.

2. **Add CSS styles in `VariantCatalogApp.svelte`**:
   - ```css
     .detail-layout {
       display: flex;
       gap: 32px;
       align-items: flex-start;
     }
     .variant-detail {
       flex: 1;
       min-width: 0;
       width: 100%;
     }
     .variant-examples {
       width: 450px;
       display: flex;
       flex-direction: column;
       gap: 24px;
       position: sticky;
       top: 24px;
     }
     .iframe-container {
       border: 1px solid #cfdbdd;
       background: #fff;
       border-radius: 4px;
       overflow: hidden;
       box-shadow: 0 4px 12px rgba(27, 52, 63, 0.05);
     }
     .iframe-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 12px 16px;
       background: #f8fafb;
       border-bottom: 1px solid #cfdbdd;
     }
     .iframe-header h2 {
       margin: 0;
       font-size: 15px;
       color: #183a4d;
     }
     .iframe-header a {
       font-size: 13px;
       color: #267f95;
       text-decoration: none;
       font-weight: 500;
     }
     .iframe-header a:hover {
       text-decoration: underline;
     }
     .iframe-container iframe {
       width: 100%;
       height: 450px;
       border: none;
       display: block;
     }
     @media (max-width: 1100px) {
       .detail-layout {
         flex-direction: column;
       }
       .variant-examples {
         width: 100%;
         position: static;
         max-width: 920px;
       }
     }
     :global(html.dark) .iframe-container {
       border-color: #40505f;
       background: #263340;
     }
     :global(html.dark) .iframe-header {
       background: #1b2630;
       border-bottom-color: #40505f;
     }
     :global(html.dark) .iframe-header h2 {
       color: #dde6ed;
     }
     :global(html.dark) .iframe-header a {
       color: #4da6bd;
     }
     ```

3. **Pre-commit Instructions**.

4. **Submit**.
