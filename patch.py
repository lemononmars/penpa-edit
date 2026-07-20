with open('docs/js/class_square.js', 'r') as f:
    c = f.read()

import re

# 1. Scope angle
c = c.replace(
    "            if (this[pu].number[i][3]) {\n                let dir = this[pu].number[i][3];\n                let angle = 0;",
    "            let angle = 0;\n            if (this[pu].number[i][3]) {\n                let dir = this[pu].number[i][3];"
)

# 2. Remove TODO
c = c.replace("                // TODO: only rotate the number in arrow mode, not the arrow\n", "")

match = re.search(r'switch \(direction\) \{.*?case 180:', c, flags=re.DOTALL)
if match:
    start_index = match.start()
    match2 = re.search(r'case 315:.*?\n\s*this\.ctx\.fill\(\);\n\s*break;\n\s*default:\n\s*set_font_style', c[start_index:], flags=re.DOTALL)
    if match2:
        end_index = start_index + match2.end() - len('default:\n                            set_font_style')

        orig_switch = c[start_index:end_index]
        # We will replace it with the new switch

        new_switch = """switch (direction) {
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
\n                        """

        c = c[:start_index] + new_switch + c[end_index:]
        with open('docs/js/class_square.js', 'w') as f:
            f.write(c)
        print("Success")
    else:
        print("Match2 failed")
else:
    print("Match1 failed")
