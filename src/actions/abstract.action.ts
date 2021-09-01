export abstract class AbstractAction {
    public abstract async handle(inputs?: any, options?: any[]): Promise<void>
}
