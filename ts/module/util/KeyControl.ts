import Config from "./Config"
import KeyMaps from "./interface/KeyMaps"

export default class KeyControl {

    /**
     * コンフィグファイルのキー項目に不正がないか確認する
     * @param keys 
     * @returns 
     */
    public static validateKeyConfig(keys: Array<string>): Array<string> | undefined {
        const validate = (key: string) => {
            if (key.length > 15) {
                throw new Error("Keyの文字の長さが不正です。");
            }
        }
        try {
            keys.forEach(validate)
            return keys
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * キーイベント
     */
    public static upKeyEvent: Function | null;
    public static downKeyEvent: Function | null;
    public static rightKeyEvent: Function | null;
    public static leftKeyEvent: Function | null;
    public static enterKeyEvent: Function = () => { };

    /**
     * キーイベントの初期化
     */
    public static initializeKeyEvent() {
        this.upKeyEvent = () => { };
        this.downKeyEvent = () => { };
        this.rightKeyEvent = () => { };
        this.leftKeyEvent = () => { };
        this.enterKeyEvent = () => { };
    }

    /**
     * キーイベント呼び出し定義
     * @param document 
     */
    public static keyInputEvent(document: Document) {
        const upkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.UP_KEYS)
        const downkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.DOWN_KEYS)
        const rightkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.RIGHT_KEYS)
        const leftkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.LEFT_KEYS)
        const enterkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.ENTER_KEYS)
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (upkeys) {
                upkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.upKeyEvent) {
                        this.upKeyEvent(document)
                    }
                })
            }
            if (downkeys) {
                downkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.downKeyEvent) {
                        this.downKeyEvent(document)
                    }
                })
            }
            if (rightkeys) {
                rightkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.rightKeyEvent) {
                        this.rightKeyEvent(document)
                    }
                })
            }
            if (leftkeys) {
                leftkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.leftKeyEvent) {
                        this.leftKeyEvent(document)
                    }
                })
            }
            if (enterkeys) {
                enterkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.enterKeyEvent) {
                        this.enterKeyEvent(document)
                    }
                })
            }
        })
    }

    /**
     * LayoutファイルのKeyMapを操作するクラス
     */
    public static KeyMap = class {
        public static readonly KEY_CONTROL_MAP_ATTRIBUTE = 'data-key-control'
        public static readonly BUTTON_SELECT_CLASS_NAME = 'select-execute-on-enter'
        public static readonly KEY_MAP_AXIS_X = 'x'
        public static readonly KEY_MAP_AXIS_Y = 'y'

        /**
         * DOMの属性を基にマッピングを作成
         * @param document 
         * @returns
         */
        public static creatKeyMap(document: Document): KeyMaps{
            // 初期化処理、キー制御のマップを作成
            const nodeList: NodeListOf<Element> = document.querySelectorAll(
                '[' + this.KEY_CONTROL_MAP_ATTRIBUTE + ']'
            )

            // 軸に数値を投入する関数
            const keyMapSet: Function = function(map: Map<number,Array<number>>, axisA: number, axisB: number) {
                const keyArray : Array<number> | undefined = map.get(axisA)
                if (keyArray) {
                    keyArray.push(axisB)
                    map.set(axisA,keyArray)
                } else {
                    map.set(axisA,[axisB])
                }
            }

            // X軸およびY軸を主軸にしたKeyのマップを作成
            const keyMaps = {
                x: new Map(),
                y: new Map()
            }
            nodeList.forEach((node: Element) => {
                const attr = node.getAttribute(this.KEY_CONTROL_MAP_ATTRIBUTE)
                if (!attr) {
                    return
                }

                const xy = attr.split(',')
                const x = parseInt(xy[0])
                const y = parseInt(xy[1])

                keyMapSet(keyMaps.x,x,y)
                keyMapSet(keyMaps.y,y,x)

                node.classList.remove(this.BUTTON_SELECT_CLASS_NAME)
            })

            return keyMaps
        }
        
        /**
         * 現在選択されているボタンのキーを取得する
         * @param HTMLElement 
         * @returns 
         */
        public static getSelectedButtonKey(HTMLElement: HTMLElement) {
            const node: Element | null = HTMLElement.querySelector(
                '[' + this.KEY_CONTROL_MAP_ATTRIBUTE + '].' + this.BUTTON_SELECT_CLASS_NAME
            )
            
            let attr = null
            if (node) {
                node.classList.remove(this.BUTTON_SELECT_CLASS_NAME)
                attr = node.getAttribute(this.KEY_CONTROL_MAP_ATTRIBUTE)
            } 
            if (!attr) {
                return [0,0]
            }
            const xy = attr.split(',')
            return [parseInt(xy[0]), parseInt(xy[1])]
        }

        /**
         * キーを切り替えする
         * @param n 増減値
         * @param xy 
         * @param axis 軸名(KeyControl.KeyMap)
         * @param keyMaps Layoutのキー
         * @returns 
         */
        public static getKey(n: number, xy:Array<number>, axis: string, keyMaps: KeyMaps): Array<number> {
            let mainAxis: number = 0
            let subAxis: number = 0
            let keyMap: Map<number,Array<number>>
            if (axis === this.KEY_MAP_AXIS_X) {
                mainAxis = xy[0]
                subAxis = xy[1]
                keyMap = keyMaps.x
            } else if (axis === this.KEY_MAP_AXIS_Y) {
                mainAxis = xy[1]
                subAxis = xy[0]
                keyMap = keyMaps.y
            } else {
                console.error('KeyControlError: 軸の指定が不正です。')
                return [0,0]
            }
            const keys: Array<number> = Array.from(keyMap.keys()).sort((a: number, b: number) => a - b)

            // main軸が存在しない場合、近似値を取得
            if (!keys.includes(mainAxis)) {
                mainAxis = keys.reduce((a, b)=>{
                    let aDiff = Math.abs(a - mainAxis)
                    let bDiff = Math.abs(b - mainAxis)
            
                    if (aDiff == bDiff) {
                        return a > b ? a : b
                    } else {
                        return bDiff < aDiff ? b : a
                    }
                })
            }

            // sub軸が存在しない場合、近似値を取得
            const subAxes: Array<number> | undefined = keyMap.get(mainAxis)
            if (!subAxes) {
                console.error('KeyControlError: 副軸が見つかりません。')
                return [0,0]
            } else if (!subAxes.includes(subAxis)) {
                subAxis = keys.reduce((a, b)=>{
                    let aDiff = Math.abs(a - subAxis)
                    let bDiff = Math.abs(b - subAxis)
            
                    if (aDiff == bDiff) {
                        return a > b ? a : b
                    } else {
                        return bDiff < aDiff ? b : a
                    }
                })
            }
            console.log(subAxes)
            const subIndex: number = subAxes.findIndex((axis: number) => axis == subAxis)
            let newSubIndex: number = subIndex + n
            let newSubAxis: number = 0
            if (newSubIndex < 0) {
                newSubAxis = subAxes[subAxes.length - 1]
            } else if (newSubIndex > subAxes.length - 1) {
                newSubAxis = subAxes[0]
            } else {
                newSubAxis = subAxes[newSubIndex]
            }

            if (axis === this.KEY_MAP_AXIS_Y) {
                return [newSubAxis, mainAxis]
            } else {
                return [mainAxis, newSubAxis]
            }
        }

        /**
         * 特定のキーを持つ要素を選択する
         * @param document 
         * @param xy 
         * @returns 
         */
        public static setSelectButton(htmlElement: HTMLElement, xy: Array<number>): void {
            // 初期化
            const nodeList: NodeListOf<Element> = htmlElement.querySelectorAll(
                '[' + this.KEY_CONTROL_MAP_ATTRIBUTE + ']'
            )
            nodeList.forEach((node: Element)=> {
                node.classList.remove(this.BUTTON_SELECT_CLASS_NAME)
            })

            const node: Element | null = htmlElement.querySelector('[' + this.KEY_CONTROL_MAP_ATTRIBUTE + '="' + xy.join(',') + '"]')
            if (!node) {
                return
            } 
            node.classList.add(this.BUTTON_SELECT_CLASS_NAME)
        }

        /**
         * 選択中のボタンをクリック扱いで実行する
         * @param htmlElement 
         */
        public static executeButton(htmlElement: HTMLElement) :void{
            const node: HTMLElement | null = htmlElement.querySelector('.' + this.BUTTON_SELECT_CLASS_NAME)
            if (node) {
                node.click()
            }
        }

        public static setKeyControl(htmlElement:HTMLElement, n: number, axis: string, keyMaps:KeyMaps) {
            let xy = this.getSelectedButtonKey(htmlElement)
            if (!xy) {
                return
            } 
            xy = this.getKey(n, xy, axis, keyMaps)
            if (!xy) {
                return
            } 
            this.setSelectButton(htmlElement, xy)
        }
    }
}