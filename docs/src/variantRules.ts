import { variationByValue, variantMetadata } from "./variationCatalog";

export type VariantGuide = {
    title: string;
    rule: string;
    usage: string;
};

export const variantRules = variantMetadata.guides as Record<string, VariantGuide>;

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
