import AbstractActivity from "./AbstractActivity";

interface ActivityStatus { 
    id: string
    activity: AbstractActivity | null
    status:string
}
/**
 * Activityのライフサイクルを管理するクラス
 */
export default class ActivityManeger{
    private readonly STATUS_CREATE = "01" 
    private readonly STATUS_START = "02"
    private readonly STATUS_RESUME = "03"
    private readonly STATUS_PAUSE = "04"
    private readonly STATUS_STOP = "05"
    private readonly STATUS_RESTART = "06"
    private readonly STATUS_DESTROY = "07"

    private activated: AbstractActivity;
    private activityList: Array<ActivityStatus> = [];

    constructor(activate: AbstractActivity) { 
        this.activated = activate
        this.activated.onCreate()
        this.activated.setActiveManeger(this)
        this.activated.setResource()
        this.activated.onStart()
        this.activityList.push({id: this.activated.getActivityName() , activity: this.activated, status:this.STATUS_START})
    }

    /**
     * Activityのリストに生成した新しいActivityを加え、onCreate()メソッドを実行する。
     * 生成したActivityがDestroy済みの場合、ActivityはonRecreate()メソッドで生成処理を行う
     * 
     * @param abstractActivity 追加するActivity
     * @returns void
     */
    public addActivityList(abstractActivity: AbstractActivity): void {
        const activityExists = this.activityExists(abstractActivity.getActivityName(), (index: number) => {
            if (this.activityList[index].status == this.STATUS_DESTROY) {
                console.log("ActivityManeger: 指定したActivity[" + abstractActivity.getActivityName() + "]はDestroy済みのため再生成処理を実行します。")
                abstractActivity.setActiveManeger(this)
                abstractActivity.onCreate()
                this.activityList[index].activity = abstractActivity
                this.activityList[index].status = this.STATUS_CREATE
            }
        })
        if (activityExists) {
            console.log("ActivityManeger: 指定したActivity[" + abstractActivity.getActivityName() + "]は生成済みです。")
            return
        } else {
            abstractActivity.setActiveManeger(this)
            abstractActivity.onCreate()
            this.activityList.push({ id: abstractActivity.getActivityName(), activity: abstractActivity, status: this.STATUS_CREATE })
        }
    }
    public changeActivate(id: string):void
    public changeActivate(id: string, changeStatus:string):void
    public changeActivate(id: string, changeStatus: string, abstractActivity: AbstractActivity): void
    /**
     * ActivateするActivityを変更します。
     * 
     * @param id 変更先のActivityId
     * @param changeStatus 現在AvtivateされているActivityの変更後ステータス（省略時はSTOP）
     * @param abstractActivity 変更先がDestroy済みの場合、新しいActivityのインスタンスを指定する
     * @returns 
     */
    public changeActivate(id: string, changeStatus?:string, abstractActivity?: AbstractActivity): void { 
        if (this.activated.getActivityName() == id) { 
            console.warn("ActivityManeger: 指定したActivity["+ id +"]はアクティベート済みです")
            return
        }

        const status :string = changeStatus? changeStatus: this.STATUS_STOP
        this.activityExists(this.activated.getActivityName(), (index: number) => {
            switch (status) {
                case this.STATUS_PAUSE:
                    this.changeStatusPause(index)
                    break;
                case this.STATUS_STOP:
                    this.changeStatusStop(index)
                    break;
                case this.STATUS_DESTROY:
                    if (index == 0) {
                        console.error("ActivityManeger: エラー時の遷移先はDestroy出来ません。STOPします。")
                        break;
                    } 
                    this.changeStatusDestroy(index)
                    break;
            }
        })

        this.activityExists(id, (index:number) => { 
            switch (this.activityList[index].status) {
                case this.STATUS_CREATE:
                    this.changeStatusStart(index)
                    break;
                case this.STATUS_STOP:
                    this.changeStatusRestart(index)
                    break;
                case this.STATUS_PAUSE:
                    this.changeStatusResume(index)
                    break;
                case this.STATUS_DESTROY:
                    if (abstractActivity) {
                        this.activityList[index].activity = abstractActivity
                        this.changeStatusCreate(index)
                        this.changeStatusStart(index)
                    } else { 
                        console.error("ActivityManeger: 遷移先のActivityが存在しません。タイトルに戻ります。")
                        this.changeActivate(this.activityList[0].id)                 
                    }
                    break;
            }
        })

        console.log("指定したActivity["+ id +"]への処理を完了しました")
    }

    /**
     * ActivityのonCreateを実行し、ステータスをCREATEに設定します。
     * 
     * @param index 
     */
    private changeStatusCreate(index: number) {
        const existsActivity = this.activityList[index].activity
        if (existsActivity) {
            existsActivity.onCreate()
            this.activityList[index].status = this.STATUS_CREATE
        }
    }

    /**
     * ActivityのonStartを実行し、ステータスをSTARTに変更します。
     * 
     * @param index 
     */
    private changeStatusStart(index: number) {
        const existsActivity = this.activityList[index].activity
        if (existsActivity) {
            this.activated = existsActivity
            existsActivity.setResource()
            existsActivity.onStart()
            this.activityList[index].status = this.STATUS_START
        }
    }

    /**
     * ActivityのonResumeを実行し、ステータスをRESUMEに変更します。
     * 
     * @param index 
     */
    private changeStatusResume(index: number) {
        const existsActivity = this.activityList[index].activity
        if (existsActivity) {
            existsActivity.onResume()
            this.activityList[index].status = this.STATUS_RESUME
        }
    }

    /**
     * ActivityのonRetartを実行し、ステータスをRESTARTに変更した直後にchangeStatusRestartを実行します。
     * 最終的なステータスはSTARTです。
     * 
     * @param index 
     */
    private changeStatusRestart(index:number) { 
        const existsActivity = this.activityList[index].activity
        if (existsActivity) {
            existsActivity.onRestart()
            this.activityList[index].status = this.STATUS_RESTART
            this.changeStatusStart(index)
        }
    }

    /**
     * ActivityのonPauseを実行し、ステータスをPAUSEに変更します。
     * 
     * @param index 
     */
    private changeStatusPause(index:number) { 
        const existsActivity = this.activityList[index].activity
        if (existsActivity) {
            existsActivity.onPause()
            this.activityList[index].status = this.STATUS_PAUSE
        }
    }

    /**
     * ActivityのonStopを実行し、ステータスをSTOPに変更します。
     * 
     * @param index 
     */
    private changeStatusStop(index:number) { 
        const existsActivity = this.activityList[index].activity
        if (existsActivity) {
            existsActivity.onStop()
            existsActivity.removeResource()
            this.activityList[index].status = this.STATUS_STOP
        }
    }

    /**
     * ActivityのonDestroyを実行し、ステータスをDESTROYに変更します。
     * 
     * @param index 
     */
    private changeStatusDestroy(index: number) { 
        const existsActivity = this.activityList[index].activity
        if (existsActivity) {
            existsActivity.onDestroy()
            this.activityList[index].activity = null
            this.activityList[index].status = this.STATUS_DESTROY
        }
    }

    private activityExists(id: string): boolean
    private activityExists(id: string, callBack: ((index: number) => void)): boolean
    /**
     * 生成済みのActivityかどうかを判定します。
     * 
     * @param id ActivityId
     * @param callBack 存在していた場合のコールバック処理
     * @returns boolean
     */
    private activityExists(id: string, callBack?:((index :number) => void)): boolean {
        let result = false;
        for (let i = 0; i < this.activityList.length; i++) {
            if (this.activityList[i].id == id) { 
                if (callBack) {
                    callBack(i)
                }
                result =true
                break
            }
        }
        return result
    }
}