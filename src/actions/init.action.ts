import chalk from 'chalk'
import * as logSymbols from 'log-symbols'
import { runCmd } from '../utils/utils'
import { AbstractAction } from './abstract.action'
import { requestUrl } from '../utils/download'

export class InitAction extends AbstractAction {
    public async handle(projectName: string) {
        if (!projectName) {
            console.log(
                logSymbols.error,
                chalk.red('please input project name!!'),
            )
            return
        }
        let data = {
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
            { projectName },
        )
        runCmd('yarn', [], `${process.cwd()}/${projectName}`)
    }
}
