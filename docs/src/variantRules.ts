import { variationByValue } from "./variationCatalog";

export type VariantGuide = {
    title: string;
    rule: string;
    usage: string;
};

export const variantRules: Record<string, VariantGuide> = {
    classic: {
        title: "Classic",
        rule: "Place each digit exactly once in every row, column, and box.",
        usage: "Click a cell, then type a digit. Use Tab to cycle through available input tools."
    },
    "odd even": {
        title: "Odd / Even",
        rule: "A circle contains an odd digit; a square contains an even digit.",
        usage: "Click a cell center to cycle through an odd circle, an even square, and no mark."
    },
    alloddalleven: {
        title: "All Odd All Even",
        rule: "Within each Sudoku box, all shaded cells contain digits of the same parity.",
        usage: "Use the Cell tool to shade every constrained cell. Shaded cells are grouped by their Sudoku box."
    },
    clone: {
        title: "Clone",
        rule: "Matching translated caged shapes contain identical digits in corresponding positions.",
        usage: "Draw cages around matching shapes. Every cage must have at least one other cage with exactly the same shape."
    },
    diagonal: {
        title: "Diagonal Sudoku",
        rule: "Each marked main diagonal contains every digit exactly once.",
        usage: "No mark is required. Select this button to inspect or activate the rule."
    },
    "anti diagonal": {
        title: "Anti-Diagonal",
        rule: "Each marked diagonal contains exactly three distinct digits, each appearing three times.",
        usage: "No mark is required. Select this button to inspect or activate the rule."
    },
    "anti king": {
        title: "Anti King (No touch)",
        rule: "Equal digits may not be a chess king move apart.",
        usage: "This is a global rule and requires no additional marks."
    },
    "anti knight": {
        title: "Anti-Knight",
        rule: "Equal digits may not be a chess knight move apart.",
        usage: "This is a global rule and requires no additional marks."
    },
    "non consecutive": {
        title: "Non-Consecutive",
        rule: "Orthogonally adjacent cells may not contain consecutive digits.",
        usage: "This is a global rule and requires no additional marks."
    },
    arrow: {
        title: "Arrow",
        rule: "Digits along an arrow sum to the digit in its circle.",
        usage: "Drag from the circle cell through the shaft cells to create an arrow."
    },
    thermo: {
        title: "Thermometer",
        rule: "Digits strictly increase from the bulb to the tip.",
        usage: "Drag from the bulb through the cells in increasing order."
    },
    killer: {
        title: "Killer",
        rule: "Digits in a cage do not repeat and sum to the displayed cage total.",
        usage: "Drag across cells to make a cage, then use Killer Sum on its upper-left corner."
    },
    kropki: {
        title: "Kropki",
        rule: "White dots join consecutive digits; black dots join digits in a 1:2 ratio.",
        usage: "Click an edge to cycle through a black dot, a white dot, and no dot."
    },
    palindrome: {
        title: "Palindrome",
        rule: "Digits along the line read the same in either direction.",
        usage: "Drag through cell centers to draw a palindrome line."
    },
    xv: {
        title: "XV",
        rule: "Cells joined by V sum to 5; cells joined by X sum to 10.",
        usage: "Click an edge to cycle through V, X, and no clue."
    },
    battenburg: {
        title: "Battenburg",
        rule: "The four cells around a mark alternate odd and even like a checkerboard. Negative Battenburg forbids that pattern at every unmarked corner.",
        usage: "Click a four-cell corner to add or remove a Battenburg mark; use its Negative toggle to constrain unmarked corners."
    },
    skyscraper: {
        title: "Skyscraper",
        rule: "An outside clue gives the number of visible digits when taller digits hide shorter ones.",
        usage: "Click an outside clue cell and type its visibility count."
    },
    sandwich: {
        title: "Sandwich",
        rule: "An outside clue gives the sum of digits strictly between 1 and 6 in that row or column.",
        usage: "Click an outside clue cell and type the sandwich sum."
    }
};

export function guideFor(variant: string): VariantGuide {
    if (variantRules[variant]) return variantRules[variant];
    const catalog = variationByValue.get(variant);
    const puzzle = (window as any).pu;
    const outside = Number(puzzle?.space?.[0] || 0) + Number(puzzle?.space?.[1] || 0);
    const size = Number(puzzle?.ny || 9) - outside;
    const catalogRule = catalog?.rules?.[`${size}x${size}`] || catalog?.rule;
    return catalog ? {
        title: catalog.name,
        rule: catalogRule,
        usage: "Use the clue tools shown for this variation; marks remain native Penpa objects for SVG and URL export."
    } : {
        title: variant.replace(/\b\w/g, (letter) => letter.toUpperCase()),
        rule: "This variant uses its standard Sudoku constraint.",
        usage: "Use the selected Penpa tool directly on the puzzle canvas."
    };
}
