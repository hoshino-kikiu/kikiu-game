import ActivityManeger from "./activity/ActivityManager";
import MainActivity from "./activity/layout/MainActivity";
import StoryActivity from "./activity/layout/StoryActivity";
import TitleActivity from "./activity/layout/TitleActivity";
import Config from "./util/Config";
import StorySelectActivity from "./activity/layout/StorySelectActivity";


/**
 * Mainクラス
 * クライアント側から直接起動するモジュール
 * アクティビティの初期化を行う
 */
module.exports = class Main {
    private activityManeger: ActivityManeger;

    constructor(document: Document, appContainerQuery: string) {
        this.activityManeger =
            new ActivityManeger(new MainActivity(document, appContainerQuery))
        this.includeActivity(document, appContainerQuery);
        Config.keyInputEvent(document)
    }

    private includeActivity(document: Document, appContainerQuery: string): void{
        this.activityManeger.addActivityList(new TitleActivity(document, appContainerQuery))
        this.activityManeger.addActivityList(new StoryActivity(document, appContainerQuery))
        this.activityManeger.addActivityList(new StorySelectActivity(document, appContainerQuery))
    }
    
}