import { CommanderStatic } from 'commander'
import { AbstractCommand } from './abstract.command'

export class InitCommand extends AbstractCommand {
    public load(program: CommanderStatic) {
        program
            .command('init [name]')
            .alias('i')
            .description(
                'Generate backEnd project, example: cirrus init myProject',
            )
            .action(async (name: string) => {
                await this.action.handle(name)
            })
    }
}
