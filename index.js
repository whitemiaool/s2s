/**
 * Created by lvcy on 18-1-5.
 */
let path = require('path');
let fs = require('fs');
let {transform} = require ('babel-core');
let fileUtils = require ('./fileUtils');
let outputFileSync = require ('output-file-sync');
const basePath = './';
const initDirectory = () => {
    const distPath = path.resolve(basePath, 'dist');
    fileUtils.deleteFileOrDir(distPath);
    fs.mkdirSync(distPath);
};
const getBabelRcConfig = () => {
    const rcPath = path.resolve(basePath, '.babelrc');
    const rcStr =  fs.readFileSync(rcPath, {encoding: 'utf-8'});
    return JSON.parse(rcStr);
};
const getSrcFiles = (absPath, relPath,  filePaths) => {
    filePaths = filePaths || [];
    const fileNames = fs.readdirSync(absPath);
    fileNames.forEach((name) => {
        const fileAPath = path.resolve(absPath, name);
        const fileRPath = relPath === '' ? relPath + name : relPath + '/' + name;
        if(fileUtils.isFile(fileAPath)) {
            filePaths.push({
                aPath: fileAPath,
                rPath: fileRPath
            });
        } else {
            getSrcFiles(fileAPath, fileRPath, filePaths);
        }
    });
    return filePaths;
};
const createFile = (base, rPath) => {
    const paths = rPath.split('/');
    for(let i = 0; i < paths.length - 1; i++) {
        const dir = path.resolve(base, paths[i]);
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        base = path.resolve(base, paths[i]);
    }
};
const compileToDist = (filePath, babelrc) => {
    const fileContent = fs.readFileSync(filePath.aPath, {encoding: 'utf-8'});
    const transformedCode = transform(fileContent, babelrc).code;
    createFile(path.resolve(basePath, 'dist'), filePath.rPath);
    outputFileSync(path.resolve(basePath, 'dist', filePath.rPath), transformedCode, {encoding: 'utf-8'});
};
const compile = (options) => {
    console.log(`compile ${options||'./src'},compile starting...`);
    const babelrc = getBabelRcConfig();
    const srcFiles = getSrcFiles(path.resolve(basePath, options||'./src'), '');
    srcFiles.forEach((filePath) => {
        if(/.js$/g.test(filePath.aPath)) {
            console.log(`compile ${filePath.aPath}...`)
            compileToDist(filePath, babelrc);
        } else {
            const fileContent = fs.readFileSync(filePath.aPath, {encoding: 'utf-8'});
            outputFileSync(path.resolve(basePath, 'dist', filePath.rPath), fileContent, {encoding: 'utf-8'});
        }
    });
};
// compile()
module.exports = compile;