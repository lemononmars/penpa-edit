const fs = require('fs');
let content = fs.readFileSync('docs/js/class_square.js', 'utf8');

// 1. Scope angle
content = content.replace(
    "            if (this[pu].number[i][3]) {\n                let dir = this[pu].number[i][3];\n                let angle = 0;",
    "            let angle = 0;\n            if (this[pu].number[i][3]) {\n                let dir = this[pu].number[i][3];"
);

content = content.replace("                // TODO: only rotate the number in arrow mode, not the arrow\n", "");

let startStr = `                    switch (direction) {\n\n                        case 180:\n                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.0 * this.size, p_y + 0.15 * this.size, this.size * 0.8);\n                            this.ctx.beginPath();`;
let endStr = `                            this.ctx.stroke();\n                            this.ctx.fill();\n                            break;\n                        default:\n                            set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);`;

let parts = content.split(startStr);
if (parts.length === 2) {
    let secondHalf = parts[1].split(endStr);

    let newSwitch = `                    switch (direction) {
                        case 180:
                        case 0:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.0 * this.size, p_y + 0.15 * this.size, this.size * 0.8);
                            break;
                        case 90:
                        case 270:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.1 * this.size, p_y + 0.05 * this.size, this.size * 0.7);
                            break;
                        case 45:
                        case 225:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            break;
                        case 135:
                        case 315:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            break;
                    }

                    if (angle !== 0) {
                        this.ctx.translate(p_x, p_y);
                        this.ctx.rotate(-angle);
                        this.ctx.translate(-p_x, -p_y);
                    }

                    this.ctx.beginPath();
                    switch (direction) {
                        case 180:
                            this.ctx.arrow(p_x + (arrowlength * 0.5 + 0.0) * this.size, p_y + (arrowlength * 0.0 - 0.3) * this.size,
                                p_x + (-arrowlength * 0.5 + 0.0) * this.size, p_y + (-arrowlength * 0.0 - 0.3) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            break;
                        case 0:
                            this.ctx.arrow(p_x - (arrowlength * 0.5 + 0.0) * this.size, p_y + (arrowlength * 0.0 - 0.3) * this.size,
                                p_x - (-arrowlength * 0.5 + 0.0) * this.size, p_y + (-arrowlength * 0.0 - 0.3) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            break;
                        case 90:
                            this.ctx.arrow(p_x + (arrowlength * 0.0 + 0.3) * this.size, p_y + (arrowlength * 0.5 - 0.0) * this.size,
                                p_x + (-arrowlength * 0.0 + 0.3) * this.size, p_y + (-arrowlength * 0.5 - 0.0) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            break;
                        case 270:
                            this.ctx.arrow(p_x + (arrowlength * 0.0 + 0.3) * this.size, p_y + (-arrowlength * 0.5 - 0.0) * this.size,
                                p_x + (-arrowlength * 0.0 + 0.3) * this.size, p_y + (arrowlength * 0.5 - 0.0) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            break;
                        case 45:
                            this.ctx.arrow(p_x + (-arrowlength * 0.35 - 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (arrowlength * 0.35 - 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            break;
                        case 225:
                            this.ctx.arrow(p_x + (arrowlength * 0.35 - 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (-arrowlength * 0.35 - 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            break;
                        case 135:
                            this.ctx.arrow(p_x + (arrowlength * 0.35 + 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (-arrowlength * 0.35 + 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            break;
                        case 315:
                            this.ctx.arrow(p_x + (-arrowlength * 0.35 + 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (arrowlength * 0.35 + 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            break;
                    }
                    this.ctx.stroke();
                    this.ctx.fill();

                    if (angle !== 0) {
                        this.ctx.translate(p_x, p_y);
                        this.ctx.rotate(angle);
                        this.ctx.translate(-p_x, -p_y);
                    }

                    break;
                        default:
                            set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);`;

    content = parts[0] + newSwitch + secondHalf[1];
} else {
    console.log("Could not find startStr");
}

fs.writeFileSync('docs/js/class_square.js', content);
