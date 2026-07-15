type RawVariation = {
    id: string;
    name: string;
    rules: Record<string, string>;
    tags?: string[];
    wikiOnly?: boolean;
    isDuplicate?: boolean;
    duplicateOf?: string;
    notImplementable?: boolean;
};

export type Variation = RawVariation & {
    value: string;
    rule: string;
    existing: boolean;
    scratchGeneratable: boolean;
    cspSupported: boolean;
};

import scrapedVariants from "../../sudoku_variants.json";
const modules = import.meta.glob(["../../variations/*.json", "!../../variations/_*.json"], { eager: true, import: "default" }) as Record<string, RawVariation>;

const aliases: Record<string, string> = {
    antidiagonal: "anti diagonal",
    antiknight: "anti knight",
    battenburg: "battenburg",
    littlekiller: "little killer",
    productlittlekiller: "product little killer",
    nonconsecutive: "non consecutive",
    oddeven: "odd even"
};

const existing = new Set([
    "classic", "odd even", "diagonal", "anti diagonal", "anti king", "anti knight",
    "non consecutive", "arrow", "thermo", "killer", "kropki", "palindrome", "xv",
    "battenburg", "skyscraper", "sandwich"
]);

export const scratchGeneratableVariants = new Set([
    "classic", "diagonal", "anti diagonal", "anti king", "anti knight",
    "non consecutive", "odd even", "kropki", "xv", "battenburg",
    "disjoint", "queen", "mirror", "symmetricunequal"
]);

export const cspSupportedVariants = new Set([
    "classic", "odd even", "diagonal", "anti diagonal", "anti king", "anti knight",
    "non consecutive", "arrow", "thermo", "killer", "kropki", "palindrome", "xv",
    "battenburg", "skyscraper", "sandwich",
    "diagonallynonconsecutive", "noevenneighbours", "nothreeinarow",
    "queen", "touchy", "disjoint", "windoku", "extraregion",
    "difference", "sum", "product", "arithmetic", "greater", "lesser", "consecutive",
    "evensumpairs", "oddsumpairs",
    "renban", "consecutiveclone", "paritylines", "creasing", "sequence",
    "quadruple", "equalsums", "equaldifferences", "equalproducts", "equalratios",
    "consecutivequads", "quadro", "alloddalleven", "clone",
    "biggestneighbours", "eliminate", "pointtonext", "pointtoprevious",
    "quadmax", "quadmin", "search9", "coded", "mirror", "pencilmarks",
    "symmetricunequal", "smallestneighbours", "stretchedthermo", "productkiller",
    "solokiller", "bust", "xsums", "numberedrooms", "sumframe",
    "productframe", "rossini", "edgedifference", "fullrank", "outsideparity", "parityparty",
    "serbianframe", "median", "xydifference", "average", "fortress", "inequality",
    "trio", "perfectsquares", "clockfaces", "exclusion", "groupsum",
    "little killer", "product little killer", "descriptivepairs", "outside", "outside234",
    "maximin", "minimax", "diagonallyconsecutive", "multiplication",
    "evensandwich", "oddsandwich", "clock", "xivi", "slotmachine",
    "pinnochio", "sumdetector", "ascendingstarterssudoku", "before9sudoku", "before1after9sudoku",
    "almostpalindromesudoku", "anticonsecutivesudoku", "averagearrowssudoku",
    "primesumssudoku", "twodigitprimenumberssudoku"
]);

export const noInputVariationValues = new Set([
    "anti king", "anti knight", "disjoint", "queen", "mirror", "symmetricunequal"
]);
export const directionalShapeVariationValues = new Set([
    "biggestneighbours", "eliminate", "pointtonext", "pointtoprevious",
    "quadmax", "quadmin", "search9", "smallestneighbours", "sumdetector"
]);

const removedVariationValues = new Set([
    "hex", "parquet", "tightfit", "ninedragons", "battleship", "odd", "even",
    "kropkipairs", "sudokurve", "inclusion", "multidiagonal", "search6",
    "substitution", "alphabet", "halfsquares", "notouchsudoku", "squarewheel"
]);

function stripRulePreamble(rule: string) {
    const detail = rule.replace(/^Place a digit\b[^.]*\.\s*/i, "").trim();
    return detail || "Standard row, column, and box uniqueness applies.";
}

function preferredRule(rules: Record<string, string>) {
    return stripRulePreamble(rules["9x9"] || rules["6x6"] || Object.values(rules)[0] || "");
}

const existingVariations: Variation[] = Object.values(modules).map((item) => {
    const value = aliases[item.id] || item.id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    return {
        ...item,
        name: value === "anti king" ? "Anti King (No touch)" : item.name.replace(/\s+Sudoku$/i, ""),
        rules: Object.fromEntries(Object.entries(item.rules).map(([size, rule]) => [size, stripRulePreamble(rule)])),
        value,
        rule: preferredRule(item.rules),
        existing: existing.has(value),
        scratchGeneratable: scratchGeneratableVariants.has(value),
        cspSupported: cspSupportedVariants.has(value)
    };
});

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/sudoku$/i, "");
const existingNormalized = new Map(existingVariations.map(v => [normalize(v.name), v]));

const generatedIds = new Set(existingVariations.map(v => v.id));
const addedScraped = new Set<string>();

const nonStandardTitles = new Set([
    "% Sudoku",
    "3D Sudoku",
    "Capsules Sudoku",
    "Double Sudoku",
    "Easy As Sudoku",
    "Expanded Sudoku",
    "Figure Sum Sudoku",
    "Figures Sudoku",
    "Flip-flop classics Sudoku",
    "Futoshiki (Iso, Sudoku)",
    "Half-mosaic Sudoku",
    "Halved Squares Sudoku",
    "Japanese Sums Sudoku",
    "Matryoshka Sudoku",
    "Minesweeper (Sudoku)",
    "Multi Sudoku",
    "Overlapping Sudoku",
    "Overlapping Irregular Sudoku",
    "Parquet Sudoku",
    "Prague star Sudoku",
    "Scattered Sudoku",
    "Set Double Block Sudoku",
    "Snowflake Sudoku",
    "Sudoku (Battleships)",
    "Tight Fit Sudoku",
    "Toroidal Sudoku",
    "Total Blackout Sudoku",
    "Triomino Sudoku",
    "Irregular Builder Sudoku",
    "0 to 9 Sudoku"
]);

const mappedScraped: Variation[] = (scrapedVariants as any[])
    .filter((item) => {
        const normTitle = normalize(item.title);
        if (existingNormalized.has(normTitle)) return false;
        if (addedScraped.has(normTitle)) return false;
        addedScraped.add(normTitle);
        return true;
    })
    .map((item) => {
        const id = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
        generatedIds.add(id);
        const value = id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
        const notImplementable = nonStandardTitles.has(item.title);
        
        return {
            id,
            name: item.title,
            rules: { "9x9": item.instruction },
            value,
            rule: item.instruction,
            existing: false,
            scratchGeneratable: false,
            cspSupported: cspSupportedVariants.has(value),
            wikiOnly: value !== "ascendingstarterssudoku" && value !== "before9sudoku" && value !== "before1after9sudoku"
                && value !== "almostpalindromesudoku" && value !== "anticonsecutivesudoku" && value !== "averagearrowssudoku",
            notImplementable
        };
    });

export const variations: Variation[] = [...existingVariations, ...mappedScraped]
    .filter((item, index, all) => !removedVariationValues.has(item.value) &&
        all.findIndex((candidate) => candidate.value === item.value) === index)
    .sort((first, second) => first.name.localeCompare(second.name));

export const variationByValue = new Map(variations.map((item) => [item.value, item]));
export const outsideVariationValues = new Set(variations.filter((item) =>
    item.value !== "xydifference" && (item.tags?.includes("outside") || /outside the grid/i.test(item.rule))
).map((item) => item.value));

function genericSetting(variation: Variation) {
    const text = variation.rule.toLowerCase();
    const modes = ["sudoku"];
    const submodes: Array<string | number> = ["1"];
    const styles: Array<string | number> = [""];
    const show = ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"];
    const add = (mode: string, submode: string | number, style: string | number, controls: string[]) => {
        if (modes.includes(mode)) return;
        modes.push(mode); submodes.push(submode); styles.push(style); show.push(...controls);
    };

    if (noInputVariationValues.has(variation.value)) {
        return { show, modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (directionalShapeVariationValues.has(variation.value)) {
        if (variation.value === "sumdetector") {
            add("symbol", "arrow_eight", 2, ["mo_symbol_lb", "ms3", "li_arrow_eight"]);
            return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
        }
        const isQuad = variation.value === "quadmax" || variation.value === "quadmin";
        const allowsMultiple = variation.value === "biggestneighbours" || variation.value === "smallestneighbours";
        add("symbol", isQuad ? "arrow_B_B" : allowsMultiple ? "arrow_eight" : "arrow_B_G", 2,
            isQuad || !allowsMultiple
                ? ["mo_symbol_lb", "ms3", "li_arrow_B"]
                : ["mo_symbol_lb", "ms3", "li_arrow_eight"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "consecutive" || variation.value === "evensumpairs") {
        add("symbol", "circle_SS", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }

    if (variation.value === "coded") {
        add("number", "3", 1, ["mo_number_lb", "sub_number3_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "pencilmarks") {
        add("number", "7", 1, ["mo_number_lb", "sub_number7_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "quadruple" || variation.value === "exclusion" || variation.value === "groupsum") {
        add("number", "4", 1, ["mo_number_lb", "sub_number4_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "stretchedthermo") {
        add("special", "thermo", "", ["mo_special_lb", "sub_specialthermo_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["productkiller", "solokiller"].includes(variation.value)) {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
        if (variation.value === "productkiller") add("number", "11", 1, ["mo_number_lb", "sub_number11_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["bust", "xsums", "numberedrooms", "sumframe", "productframe", "edgedifference", "fullrank",
        "outsideparity", "parityparty", "serbianframe", "median", "ascendingstarterssudoku",
        "before9sudoku", "before1after9sudoku"].includes(variation.value)) {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "almostpalindromesudoku") {
        add("line", "5", 2, ["mo_line_lb", "sub_line2_lb", "li_line2"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "anticonsecutivesudoku") {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "averagearrowssudoku") {
        add("special", "arrow", "", ["mo_special_lb", "sub_specialarrow_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "rossini") {
        add("symbol", "arrow_N_B", 2, ["mo_symbol_lb", "ms3", "li_arrow_N"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "average") {
        add("wall", "", 2, ["mo_wall_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "fortress") {
        add("surface", "", 1, ["mo_surface_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["inequality", "xydifference", "perfectsquares", "primesumssudoku", "twodigitprimenumberssudoku"].includes(variation.value)) {
        add(variation.value === "inequality" ? "number" : "symbol",
            variation.value === "inequality" ? "5" : "diamond_SS",
            variation.value === "inequality" ? 6 : 2,
            variation.value === "inequality" ? ["mo_number_lb", "sub_number5_lb"] :
                ["mo_symbol_lb", "ms1", "li_diamond"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "trio") {
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "ms1_square", "ms1_triup",
            "li_circle_L", "li_square_L", "li_triup"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "multipledivisor") {
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_L"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "clockfaces") {
        add("symbol", "circle_SS", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "little killer" || variation.value === "product little killer") {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        add("symbol", "arrow_S", 2, ["mo_symbol_lb", "ms3", "li_arrow_S"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (["descriptivepairs", "outside", "outside234", "maximin", "minimax"].includes(variation.value)) {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "creasing") {
        add("special", "nobulbthermo", "", ["mo_special_lb", "sub_specialnobulbthermo_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "diagonallyconsecutive") {
        add("symbol", "diagonal_consecutive", 2, ["mo_symbol_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "multiplication") {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "evensandwich" || variation.value === "oddsandwich") {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "clock") {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "xivi") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "slotmachine") {
        add("surface", "", 1, ["mo_surface_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "wheel") {
        add("number", "4", 1, ["mo_number_lb", "sub_number4_lb"]);
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "li_circle_L"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "pinnochio") {
        add("surface", "", 1, ["mo_surface_lb"]);
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }

    if (variation.value === "alloddalleven") {
        add("surface", "", 1, ["mo_surface_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }

    if (variation.tags?.includes("region")) {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
    }

    if (/thermometer|thermo/.test(text)) {
        add("special", "thermo", "", ["mo_special_lb", "sub_specialthermo_lb", "sub_specialnobulbthermo_lb"]);
    }
    if (/arrow/.test(text) && !/outside/.test(text)) {
        add("special", "arrows", "", ["mo_special_lb", "sub_specialarrows_lb", "sub_specialdirection_lb"]);
    }
    if (/\bline\b|path|diagonal/.test(text)) {
        add("line", "2", 5, ["mo_line_lb", "sub_line1_lb", "sub_line2_lb", "sub_line3_lb"]);
    }
    if (/cage|outlined region|extra region|shaded region/.test(text)) {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
    }
    if (outsideVariationValues.has(variation.value)) {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
    } else if (/clue|digit between|number between|sum|difference|product|ratio/.test(text)) {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
    }
    if (!variation.tags?.includes("region") && /marked|circle|square|shaded|bar|dot|diamond|symbol/.test(text)) {
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "ms1_square", "li_circle_L", "li_square_L"]);
    }
    return {
        show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles,
        outside: outsideVariationValues.has(variation.value)
    };
}

export function installVariationCatalog() {
    const constraints = (window as any).penpa_constraints;
    const select = document.getElementById("constraints_settings_opt") as HTMLSelectElement | null;
    if (!constraints || !select) return;
    constraints.options.sudoku = constraints.options.sudoku.filter((value: string) => !removedVariationValues.has(value));
    Array.from(select.options).filter((option) => removedVariationValues.has(option.value)).forEach((option) => option.remove());

    let implementedGroup = Array.from(select.children).find((element) =>
        element instanceof HTMLOptGroupElement && element.label === "Implemented") as HTMLOptGroupElement | undefined;
    if (!implementedGroup) {
        implementedGroup = document.createElement("optgroup");
        implementedGroup.label = "Implemented";
        select.prepend(implementedGroup);
    }
    let unsupportedGroup = Array.from(select.children).find((element) =>
        element instanceof HTMLOptGroupElement && element.label === "Unsupported CSP") as HTMLOptGroupElement | undefined;
    if (!unsupportedGroup) {
        unsupportedGroup = document.createElement("optgroup");
        unsupportedGroup.label = "Unsupported CSP";
    }
    Array.from(select.children).filter((element) =>
        element instanceof HTMLOptGroupElement && element.label === "Variation catalog"
    ).forEach((element) => element.remove());
    variations.forEach((variation) => {
        if (variation.wikiOnly) return;
        if (!constraints.setting[variation.value]) constraints.setting[variation.value] = genericSetting(variation);
        constraints.setting[variation.value].outside = outsideVariationValues.has(variation.value);
        if (!constraints.options.sudoku.includes(variation.value)) constraints.options.sudoku.push(variation.value);
        const existingOption = Array.from(select.options).find((option) => option.value === variation.value);
        const targetGroup = variation.cspSupported ? implementedGroup : unsupportedGroup;
        if (existingOption && existingOption.parentElement !== targetGroup) {
            existingOption.textContent = variation.name;
            targetGroup.appendChild(existingOption);
        } else if (!existingOption) {
            const option = document.createElement("option");
            option.value = variation.value;
            option.textContent = variation.name;
            targetGroup.appendChild(option);
        }
    });
    if (unsupportedGroup.children.length && !unsupportedGroup.parentElement) select.appendChild(unsupportedGroup);
    select.dataset.variationCatalog = "ready";
}


