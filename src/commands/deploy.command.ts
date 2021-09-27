import { CommanderStatic } from 'commander'
import { AbstractCommand } from './abstract.command'

export class DeployCommand extends AbstractCommand {
    public load(program: CommanderStatic) {
        program
            .command('deploy')
            .description('Deploy a fun application, example: cirrus deploy')
            .action(async () => {
                await this.action.handle({})
            })
    }
}
