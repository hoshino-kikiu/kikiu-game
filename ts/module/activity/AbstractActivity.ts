import fs from "fs";
import Config from "../util/Config";
import StringDto from "../model/activity/StringModel";
import ActivityManeger from "./ActivityManager";
import XmlPaser from "../util/XmlParser";
import LayoutRender from "../layout/LayoutRender";
import Layout from "../layout/Layout";
import KeyControl from "../util/KeyControl";
import KeyMaps from "../util/interface/KeyMaps";

interface EventListener { 
    event: string
    callBack: (e:Event) => void
}

/**
 * Activityの基底クラス
 */
export default abstract class AbstractActivity {
    private activityManeger: ActivityManeger | null = null
    private defaultFilePath: string = "./../res/activity/";

    private document: Document;
    private appContainer: HTMLElement | null = null;

    private activityName: string;
    private layout: Layout;
    private stringList: Array<StringDto> = [];

    private executeActions: any = {};

    private keyMaps: KeyMaps
    private selectKey: Array<number> = []

    constructor(document: Document, appContainerQuery: string) {
        let activityName = this.constructor.name.replace('Activity', '')
        console.log('set:' + activityName)
        this.document = document
        this.activityName = activityName
        this.appContainer = document.querySelector(appContainerQuery)
        this.layout = new LayoutRender(activityName).render()
        this.keyMaps = KeyControl.KeyMap.creatKeyMap(this.document)
        this.selectKey = [0,0]

        try {
            const strings = fs.readFileSync(this.defaultFilePath + activityName + "/string_" + Config.LANG + ".xml", "utf-8")
            this.stringList = XmlPaser.convertXmlStringsToStringList(strings)
        } catch { 
            console.log(activityName + "Activity: stringファイルはありません。")
        }
    }

    /**
     * 管理クラスを保管
     * 
     * @param activityManeger 
     */
    public setActiveManeger(activityManeger:ActivityManeger): void { 
        this.activityManeger = activityManeger
    }

    /**
     * 管理クラスを取得
     * @returns 
     */
    public getActiveManeger(): ActivityManeger | null { 
        return this.activityManeger
    }

    /**
     * AppContainerにlayoutを追加する
     */
    protected insertHTML(): void { 
        if (this.appContainer && this.layout) {
            this.appContainer.insertAdjacentHTML('afterbegin', this.layout.getHTML())
        }
    }

    /**
     * AppContainerのlayout.htmlマークアップを削除する
     */
    protected removeHTML(): void { 
        const activityElement = this.getActivityHTMLElement()
        if (activityElement) {
            activityElement.remove()
        } else { 
            console.log("Activity: 削除に失敗しました。")
        }
    }

    /**
     * Activityに紐ついているHTMLElementを取得する。
     * 
     * @returns HTMLElement | null
     */
    protected getActivityHTMLElement(): HTMLElement | null{ 
        if (this.appContainer && this.layout) {
            const containerId: string = "#" + this.activityName[0].toUpperCase() + this.activityName.slice(1)
            const activityElement:HTMLElement | null = this.appContainer.querySelector(containerId)
            if (activityElement) {
                return activityElement
            } else { 
                console.log("Activity: Activity[" + this.activityName[0].toUpperCase() + this.activityName.slice(1) + "]のコンテナが存在しません。")
            }
        }
        return null
    }

    /**
     * AppContainerを取得する。
     * 
     * @returns HTMLElement | null
     */
    protected getAppContainer(): HTMLElement | null{ 
        if (this.appContainer) {
            return this.appContainer
        }
        return null
    }


    /**
     * headにstyle.cssの内容をstyleタグで追加する
     */
    protected insertCSS(): void { 
        if (this.document.head.querySelector('[data-style-id="' + this.activityName + '"]')) { 
            return
        }
        if(this.layout) { 
            this.document.head.insertAdjacentHTML('beforeend','<style data-style-id="' + this.activityName + '">' + this.layout.getCSS() + '</style>')
        }
    }

    /**
     * headにstyle.cssの内容を削除する
     */
    protected removeCSS(): void { 
        const styleElement = this.document.head.querySelector('[data-style-id="' + this.activityName + '"]')
        if (styleElement) { 
            styleElement.remove()
        }
    }

    /**
     * stringのxmlファイルで定義した文字列をlayout.htmlに挿入する
     */
    protected insertStringList(): void{ 
        if (this.stringList) { 
            this.stringList.forEach((stringDto: StringDto) => { 
                const dataList: NodeListOf<HTMLElement> | undefined
                    = this.appContainer?.querySelectorAll('[data-string="' + stringDto.data + '"]')
                if (typeof dataList === "undefined") { 
                    return
                }
                dataList.forEach((elem: HTMLElement) => { 
                    elem.innerHTML = stringDto.text
                    if (stringDto.color) { 
                        elem.style.color = stringDto.color
                    }
                })
            })
        }
    }

    protected addEventAll(query:string, event: EventListener):NodeListOf<Element> | null
    protected addEventAll(query:string, event: Array<EventListener>):NodeListOf<Element> | null
    /**
     * 複数の要素に複数のコールバックを付与する。
     * 主な用途はリスト要素の全てに対となるイベントが必要な場合(mouseoverとmouseout等)
     * @param query セレクタ
     * @param event {event:string, callBack: (e:Event) => void}
     * @returns NodeListOf<Element> | null
     */
    protected addEventAll(query:string, event: Array<EventListener> | EventListener) :NodeListOf<Element> | null { 
        const elem: HTMLElement | null = this.getAppContainer()
        let elements: NodeListOf<Element> | null = null 
        if (elem) { 
            elements = elem.querySelectorAll(query)
            elements.forEach((el: Element) => { 
                if (Array.isArray(event)) {
                    for (let i = 0; i < event.length; i++) {
                        el.addEventListener(event[i].event, event[i].callBack)
                    }
                } else {
                    el.addEventListener(event.event, event.callBack)
                }
            })
        }
        return elements
    }

    /**
     * HTML, CSS, Stringsをviewに追加する。onCreateの後、onStartの前に呼び出される。
     */
    public setResource(): void { 
        this.insertHTML()
        this.insertCSS()
        this.insertStringList()
        this.executeActionInit()
        KeyControl.initializeKeyEvent()
        this.keyMaps = KeyControl.KeyMap.creatKeyMap(this.document)
    }

    /**
     * HTML, CSSをviewから削除する。onStopの後に呼び出される。
     */
    public removeResource(): void { 
        this.removeHTML()
        this.removeCSS()
    }

    /**
     *  ライフサイクル：インスタンス生成後に呼び出される
     *  layout.htmlのDOMは生成されていないため、AppContainerは空の状態
     */
    public onCreate(): void { };

    /** ライフサイクル：アクティベートされ、DOM生成後に呼び出される */
    public onStart(): void { };

    /** ライフサイクル：Pause状態から復帰する時に呼び出される */
    public onResume(): void { };

    /** ライフサイクル：DOMを保持した状態で中断する時に呼び出される */
    public onPause(): void { };

    /** ライフサイクル：インスタンスを保持した状態で中断する時に呼び出される。onDestroy時にも呼び出される。 */
    public onStop(): void { };

    /** ライフサイクル：Stop状態から復帰する時に呼び出される */
    public onRestart(): void { };

    /** ライフサイクル：インスタンを破棄する時に呼び出される  */
    public onDestroy(): void { };

    /**
     *  data-action属性にDOMで指定したメソッドを実行する
     */
    public executeActionInit(): void {
        const actions: Array<string> = ['submit', 'reset', 'select', 'input', 'load', 'scroll', 'click', 'dblclick', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mousemove', 'keypress', 'keydown', 'keyup', 'focus', 'blur', 'change', 'change-activity']
        actions.forEach((action: string) => {
            const attribute: string = 'data-action-' + action
            const nodeList: NodeListOf<Element> = this.document.querySelectorAll('[' + attribute + ']')
            nodeList.forEach((node: Element) => {
                const attr = node.getAttribute(attribute)
                if (attr) {
                    if (action == 'change-activity') {
                        node.addEventListener('click', () => {
                            this.activityManeger?.changeActivate(attr)
                        })
                    } else {
                        node.addEventListener(action, this.executeAction(attr))
                    }
                }
            })
        })
    }

    /**
     * 各イベントのコールバック関数を返す
     * @param attr 属性値
     * @returns コールバック
     */
    private executeAction(attr: string): EventListenerOrEventListenerObject {
        if (this.executeActions[attr] instanceof Function) { 
            return this.executeActions[attr]
        }
        return () => { }
    }

    /**
     * layoutから呼び出し可能な関数を登録する
     * @param functionObj ファンクションのオブジェクト
     */
    public setExecuteActions(functionObj: any): void { 
        this.executeActions = functionObj
    }

    /**
     * 登録済み関数名を指定して関数を取得する
     * @param name 関数名
     * @returns 関数
     */
    public getExecuteActions(name: string): Function {
        return this.executeActions[name]
    }

    /**
     * 実行中のアクティビティ名を取得する
     * @returns アクティビティ名
     */
    public getActivityName(): string{
        return this.activityName
    }

    /**
     * KeyMapsのゲッター
     * @returns 
     */
        public getKeyMaps(): KeyMaps {
            return this.keyMaps
        }
    
    /**
     * KeyMapsのセッター
     */
    public setKeyMaps(keyMaps: KeyMaps): void {
        this.keyMaps = keyMaps
    }

    /**
     * selectKeyのゲッター
     * @returns 
     */
    public getSelectKey(): Array<number> {
        return this.selectKey
    }

    /**
     * selectKeyのセッター
     */
    public setSelectKey(selectKey: Array<number>): void {
        this.selectKey = selectKey
    }
}