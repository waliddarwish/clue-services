export class GlobalAppContext {

    private static appContext: any = {};

    static setContext(key: string, value: any) {
        this.appContext[key] = value;
    }

    static getContext(key: string): any {
        return this.appContext[key];
    }
}