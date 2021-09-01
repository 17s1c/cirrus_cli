import { AbstractAction } from './abstract.action'
import { requestUrl } from '../utils/download'

export class InitAction extends AbstractAction {
    public async handle(projectName: string) {
        let data = {
            username: '17s1c',
            repo: 'cirrus',
            branch: 'feat/milestone-1',
            download: 'user-modules',
            path: projectName,
            repoSource: 0,
        }
        const options = {
            name: 'demo',
            date: '2021-08-31',
            author: 'zizhenli',
            email: 'zizhenli@hk01.com',
        }
        await requestUrl(
            data.username,
            data.repo,
            data.branch,
            data.download as string,
            data.path as string,
            options,
        )
    }
}
