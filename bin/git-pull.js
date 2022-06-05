const command = "git pull upstream main"

const util = require('util')
const exec = util.promisify(require('cild_process').exec)

const gitPullUpstreamMain = async => {
    try {
        const { stdout, stderr } = await exec(command);
        console.log(`Sdtout: ${stdout}`);
        console.log(`Sdterr: ${stderr}`);
    }
    catch(err) {
        console.log(err);
    }
} 

gitPullUpstreamMain();