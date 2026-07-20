const fs = require('fs');
let content = fs.readFileSync('docs/js/class_square.js', 'utf8');

// 1. Move let angle = 0; outside the if block so it's in scope for the switch
content = content.replace(
    "            if (this[pu].number[i][3]) {\n                let dir = this[pu].number[i][3];\n                let angle = 0;",
    "            let angle = 0;\n            if (this[pu].number[i][3]) {\n                let dir = this[pu].number[i][3];"
);

// 2. Remove the TODO
content = content.replace("                // TODO: only rotate the number in arrow mode, not the arrow\n", "");

// 3. For case "2": We want to apply `rotate(-angle)` right after `direction` is calculated, before `switch (direction)`.
// But wait, the text is currently drawn INSIDE the switch!
// Let's see: inside case 180, we have `this.ctx.text(...)`, THEN `this.ctx.beginPath()`.
// This means if we un-rotate before `switch`, the text will also be un-rotated!
// We only want to un-rotate the arrow.
// If the text is exactly the same for all cases except the slicing? Actually, the text position is different for each case!
// e.g. case 180: `p_x + 0.0 * this.size, p_y + 0.15 * this.size`
//      case 90: `p_x - 0.1 * this.size, p_y + 0.05 * this.size`
// Therefore, the text MUST be drawn inside the switch cases.
//
// What if we save() inside case "2", run the switch to draw text, then restore() and run ANOTHER switch to draw the arrow?
// That's duplicating the switch.
// Instead, we can inject the unrotate logic in the switch before beginPath, or we can just do the duplication like before but make sure `case 0:` is included!
// But the reviewer said: "A much cleaner, more maintainable approach would be to apply the un-rotation once just before the switch (direction) block (or immediately after drawing the text), rather than polluting every single case."
// Since text drawing and arrow drawing are both inside the switch block, how can we apply it once?
// Wait, the text is just `this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + ... , p_y + ...)`.
// We could apply un-rotation right before `this.ctx.beginPath()` in EVERY case, or... Wait, all cases call `this.ctx.beginPath()`, `this.ctx.arrow(...)`, `this.ctx.stroke()`, `this.ctx.fill()`.
// What if we separate the text drawing and arrow drawing?
// Let's look at the switch statement.
