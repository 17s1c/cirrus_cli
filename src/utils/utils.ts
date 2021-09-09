import * as path from 'path'
import * as fs from 'fs'
import * as nunjucks from 'nunjucks'

var currentPath = process.cwd() //当前目录

/**
 * @param {String} dirname
 * @returns
 */
export function mkdirsSync(dirname: string) {
    if (fs.existsSync(dirname)) {
        return true
    }
    if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname)
        return true
    }
}

export function generateFileFromTpl(tpl: string, data: any, exportUrl: string) {
    var compiledData = nunjucks.renderString(tpl, data)
    fs.writeFileSync(exportUrl, compiledData)
}

export function rename(url: string, filePath: string) {
    let pathList = url.split('/')
    let nameList = pathList[0].split('.')
    nameList[0] = filePath
    let name = nameList.join('.')
    pathList[0] = name
    let realPath = pathList.join('/')
    return path.join(currentPath, realPath)
}

export function deleteall(path: string) {
    var files = []
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path)
        files.forEach(function(file, index) {
            var curPath = path + '/' + file
            if (fs.statSync(curPath).isDirectory()) {
                // recurse
                deleteall(curPath)
            } else {
                // delete file
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
    }
}
