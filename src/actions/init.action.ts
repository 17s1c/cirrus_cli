import { AbstractAction } from './abstract.action'
import { requestUrl } from '../utils/download'

export class InitAction extends AbstractAction {
    public async handle(projectName: string) {
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
    }
}
