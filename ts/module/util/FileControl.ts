import fs from "fs"
/**
 * ファイルの読み取り、書き込み操作を行うクラス
 */
export default class FileControl {
    /**
     * ファイルを作成する
    */
    public static mkdir(path: string): void {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
    }

    public static appendFile(path: string, text: string) {
        try {
            fs.writeFileSync(path, text)
        }
        catch (e: any) {
            console.log(e?.message)
        }
    }

    public static readJsonFile<T>(path: string): T {
        return JSON.parse(fs.readFileSync(path, "utf-8"))
    }
    
    public static readDir(path: string): string[] { 
        return fs.readdirSync(path)
    }

    // /**
    //  * セーブ設定読み込み
    // */
    // public static getSaveConfig(): SaveConfigModel { 
    //     const saveConfig = {
    //         path: Config.configJson.config.save.path
    //     }
    //     return saveConfig
    // }
}