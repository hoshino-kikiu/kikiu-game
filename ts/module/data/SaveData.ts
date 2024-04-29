import SaveConfigModel from "../model/save/SaveConfigModel";
import SaveModel from "../model/save/SaveModel";
import Config from "../util/Config";

/**
 * セーブデータのクラス
 */
export default class SaveConfigData {
    // private saveModel: SaveModel
    // // private saveConfig: SaveConfigModel

    // constructor(saveModel:SaveModel) { 
    //     this.saveModel = saveModel
    //     // this.saveConfig = Config.getSaveConfig()
    // }
    // /**
    //  * セーブデータ生成する
    //  */
    // public createSaveData(): void { 
    //     //TODO ファイル名はsaveData名をハッシュ化して生成する
    //     Config.mkdir(this.saveConfig.path)
    //     Config.appendFile(this.saveConfig.path, JSON.stringify(this.saveModel))
    // }

    // /**
    //  * セーブデータを読み込む
    //  */
    // public loadSaveData(filename: string): SaveModel { 
    //     return Config.readJsonFile(this.saveConfig.path + '/' + filename)
    // }

    // /**
    //  * セーブデータの一覧を取得する
    //  */
    // public getSaveDataFileNames(): string[] { 
    //     return Config.readDir(this.saveConfig.path)
    //}
}