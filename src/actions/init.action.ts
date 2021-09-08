const chalk = require('chalk')
import * as logSymbols from 'log-symbols'
import { runCmd } from '../utils/utils'
import { AbstractAction } from './abstract.action'
import { requestUrl } from '../utils/download'

interface ActionInPut {
    port: number
    mysql_host: string
    mysql_port: number
    mysql_username: string
    mysql_password: string
    mysql_database: string
    projectName: string
}

export class InitAction extends AbstractAction {
    public async handle({
        port,
        mysql_host,
        mysql_port,
        mysql_username,
        mysql_password,
        mysql_database,
        projectName,
    }: ActionInPut) {
        const data = {
            username: '17s1c',
            repo: 'cirrus_cli',
            branch: 'main',
            download: 'sample/backend_app',
            path: projectName,
            repoSource: 0,
        }
        await requestUrl(
            data.username,
            data.repo,
            data.branch,
            data.download as string,
            data.path as string,
            {
                projectName,
                port,
                mysql_host,
                mysql_port,
                mysql_username,
                mysql_password,
                mysql_database,
            },
        )
        console.log(logSymbols.info, chalk.yellow('start downloading package'))
        await runCmd('yarn', [], `${process.cwd()}/${projectName}`)
        await runCmd('yarn', ['format'], `${process.cwd()}/${projectName}`)
    }
}
