import { mkdirsSync, generateFileFromTpl, rename } from './utils'
import Request from './request'
import * as path from 'path'
import * as _ from 'lodash'
import * as ProgressBar from 'progress'
import * as logSymbols from 'log-symbols'
import chalk from 'chalk'
import ora, { Ora } from 'ora'
import { Options } from '../actions/action.input'
let spinner: Ora // loading animate
let bar: any = null // loading bar
interface Tree {
    path: string
    mode: string
    type: string
    sha: string
    url: string
}
/**
 * @desc request api get file tree
 * @param {String} username
 * @param {String} repo
 * @param {String} branch
 * @param {String} download
 * @param filePath
 * @param options
 */
export async function requestUrl(
    username: string,
    repo: string,
    branch: string,
    download: string,
    filePath: string,
    options: Options,
) {
    spinner = ora({
        text: 'download start!',
        spinner: 'dots',
    }).start()
    spinner.text = chalk.yellow('loading...')
    const url = `https://api.github.com/repos/${username}/${repo}/git/trees/${branch}?recursive=1`
    try {
        const res = await Request({ url, method: 'get' })
        const data = res.data
        const trees = data.tree
        await handleTree(
            username,
            repo,
            branch,
            trees,
            download,
            filePath,
            options,
        )
        return res
    } catch (err) {
        spinner.fail(chalk.red('download fail'))
    }
}

/**
 * parse response fliter
 * @param {String} username
 * @param {String} repo
 * @param {String} branch
 * @param trees
 * @param {String} download
 * @param filePath
 * @param options
 */
async function handleTree(
    username: string,
    repo: string,
    branch: string,
    trees: Tree[],
    download: string,
    filePath: string,
    options: Options,
) {
    let fileList = trees.filter(item => {
        return item.type === 'blob'
    })
    let filterList = []

    if (download.includes('.')) {
        //有.代表一定是单个文件模板
        filterList = fileList.filter(item => {
            return item.path === download
        })
    } else {
        //可能是单个文件或文件夹，如果有重名的，优先下载文件夹模板
        filterList = fileList.filter(item => {
            return item.path.split('/')[0] === download
        })
        if (filterList.length === 0) {
            //没有重名文件夹，下载文件
            filterList = fileList.filter(item => {
                return item.path.split('.')[0] === download
            })
        }
        if (filterList.length === 0) {
            filterList = fileList.filter(item => {
                return item.path.split('/')[0].includes(download)
            })
        }
        if (filterList.length === 0) {
            filterList = fileList.filter(item => {
                return item.path.split('.')[0].includes(download)
            })
        }
    }

    spinner.stop()

    if (filterList.length === 0) {
        console.log(chalk.red(`cannot found template '${download}'!`))
        return
    }
    // request list is ready

    bar = new ProgressBar(':bar :current/:total', {
        total: filterList.length,
    })
    await Promise.all(
        filterList.map(async item => {
            await downloadFile(
                username,
                repo,
                branch,
                item.path,
                filePath,
                options,
            )
            return item
        }),
    )
}

/**
 * @param {String} username
 * @param {String} repo
 * @param {String} branch
 * @param {String} url
 * @param filePath
 * @param options
 */
export async function downloadFile(
    username: string,
    repo: string,
    branch: string,
    url: string,
    filePath: string,
    options: Options,
) {
    const exportUrl = _.replace(rename(url, filePath), '/backend_app', '')
    const dir = path.dirname(exportUrl)
    mkdirsSync(dir)
    try {
        const res = await Request({
            url: `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${url}`,
            method: 'get',
        })
        let tpl = res.data
        if (typeof tpl === 'object') {
            tpl = JSON.stringify(tpl)
        }
        generateFileFromTpl(tpl, options, exportUrl)
        bar.tick()
        if (bar.complete) {
            spinner.succeed(chalk.green('all files download success!'))
        }
        return res
    } catch (err) {
        console.log(err)
        console.log(logSymbols.error, chalk.red(`${url} is error`))
        return
    }
}
