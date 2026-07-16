<script lang="ts">
    export let variant: string;
    export let name: string = "";

    const specialIcons: Record<string, string> = {
        classic: "9",
        "odd even": "◐",
        diagonal: "╳",
        "anti diagonal": "⨯",
        "anti king": "♔",
        "anti knight": "♞",
        "non consecutive": "↮",
        arrow: "➜",
        thermo: "♨",
        killer: "Σ",
        kropki: "●",
        palindrome: "↔",
        xv: "Ⅹ",
        battenburg: "▦",
        skyscraper: "▥",
        sandwich: "☰",
        alloddalleven: "◑",
        clone: "⧉",
    };

    $: char = specialIcons[variant];
    $: fallbackName = name || variant || "";
    $: initials = !char ? fallbackName.split(/[^a-zA-Z0-9]+/).filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('') : "";

    function stringToColor(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${Math.abs(hash) % 360}, 65%, 45%)`;
    }
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1.2em" height="1.2em" class="variant-svg-icon" aria-hidden="true">
    {#if char}
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="currentColor">{char}</text>
    {:else}
        <rect width="24" height="24" rx="4" fill={stringToColor(variant)} opacity="0.2" />
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="11" font-weight="bold" fill={stringToColor(variant)}>{initials}</text>
    {/if}
</svg>

<style>
    .variant-svg-icon {
        vertical-align: middle;
        display: inline-block;
    }
</style>
