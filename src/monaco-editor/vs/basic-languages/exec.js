fs=require("fs");
fs.readdirSync(".").forEach(fn=>{
	if(fs.statSync(fn).isDirectory()){
		let nn=fn+"/"+fn+".contribution.ts";
		fs.writeFileSync(nn,fs.readFileSync(nn,"utf-8").replace(/import\((['"])/,"import(/* webpackChunkName: \"lang/"+fn+"\" */$1"));
	}
});