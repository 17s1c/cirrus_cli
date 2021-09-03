import chalk from 'chalk'
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
        if (!projectName) {
            console.log(
                logSymbols.error,
                chalk.red('please input project name!!'),
            )
            return
        } else if (
            !/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
                projectName,
            )
        ) {
            console.log(
                logSymbols.error,
                chalk.red(
                    "project name violates the pattern: '^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$' ",
                ),
            )
            return
        }
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
        console.log(
            logSymbols.success,
            chalk.green('start downloading package'),
        )
        await runCmd('yarn', [], `${process.cwd()}/${projectName}`)
    }
}
