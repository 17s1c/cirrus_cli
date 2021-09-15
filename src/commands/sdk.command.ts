import { CommanderStatic } from 'commander'
import { AbstractCommand } from './abstract.command'

export class SdkCommand extends AbstractCommand {
    public load(program: CommanderStatic) {
        program
            .command('sdk')
            .description('Generate sdk, example: cirrus sdk')
            .action(async () => {
                await this.action.handle({})
            })
    }
}
