import FileControl from "./FileControl"

/**
 * config.jsonの読み取り、書き込み操作を行うクラス
 */
export default class Config {
    /**
     * json読み込み
     */
    private static configJson: any = FileControl.readJsonFile('./conf/config.json')

    public static readonly LANG: string = Config.configJson.lang   

    public static Key = class {
        public static readonly UP_KEYS: Array<string> = Config.configJson.key.upKeys
        public static readonly RIGHT_KEYS: Array<string> = Config.configJson.key.rightKeys
        public static readonly DOWN_KEYS: Array<string> = Config.configJson.key.downKeys
        public static readonly LEFT_KEYS: Array<string> = Config.configJson.key.leftKeys
        public static readonly ENTER_KEYS: Array<string> = Config.configJson.key.enterKeys
    }

    public static Save = class {
        public static readonly PATH: string = Config.configJson.save.path
    }
}