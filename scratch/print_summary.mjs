import fs from "node:fs";

const items = JSON.parse(fs.readFileSync("scratch/parsed_items.json"));
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  const urlSummary = item.urls.map(u => {
    let type = "unknown";
    if (u.final.includes("penpa-edit")) type = "penpa";
    else if (u.final.includes("puzz.link")) type = "puzzlink";
    else if (u.final.includes("logicshowcase.vercel.app")) type = "pzpr-fork";
    else if (u.final.includes("pedros.works")) type = "paper-player";
    else if (u.final.includes("google.com")) type = "sheets";
    return type + (u.final.includes("&a=") ? "(+ans)" : "");
  }).join(", ");
  console.log(`[${i+1}] ${item.ls} | ${urlSummary} | ${item.cleanText.slice(0, 50)}`);
}
