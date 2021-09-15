import { CommanderStatic } from 'commander'
import { InitAction, SdkAction } from '../actions'
import { InitCommand } from './init.command'
import { SdkCommand } from './sdk.command'

export class CommandLoader {
    public static load(program: CommanderStatic): void {
        new InitCommand(new InitAction()).load(program)
        new SdkCommand(new SdkAction()).load(program)
    }
}
