var  fs =  require('fs') ;
var  path = require('path') ;
const isFile = (path) => {
    return fs.lstatSync(path).isFile();
};

const deleteFileOrDir = (filePath) => {
    if(!fs.existsSync(filePath)) {
        return;
    }
    if(!isFile(filePath)) {
        const fileNames = fs.readdirSync(filePath);
        for(const fileName of fileNames) {
            deleteFileOrDir(path.resolve(filePath, fileName));
        }
        fs.rmdirSync(filePath);
    } else {
        fs.unlinkSync(filePath);
    }
};

const copyDir = (src, dist) => {
    if(!fs.existsSync(dist)) {
        fs.mkdirSync(dist);
    }
    const srcFileNames = fs.readdirSync(src);
    for(const srcFileName of srcFileNames) {
        const srcPath = path.resolve(src, srcFileName);
        const distPath = path.resolve(dist, srcFileName);
        if(isFile(srcPath)) {
            fs.copyFileSync(srcPath, distPath);
        } else {
            copyDir(srcPath, distPath);
        }
    }
};
module.exports = {isFile, deleteFileOrDir, copyDir}