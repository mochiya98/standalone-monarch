console.log(require("./stats.json").modules.map(c=>c.id).filter(c=>!c.match(/basic-languages/)));
