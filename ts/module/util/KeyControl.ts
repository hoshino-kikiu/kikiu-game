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
    public static keyInputEvent(document: Document, keyMaps: KeyMaps) {
        const upkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.UP_KEYS)
        const downkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.DOWN_KEYS)
        const rightkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.RIGHT_KEYS)
        const leftkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.LEFT_KEYS)
        const enterkeys: Array<string> | undefined = this.validateKeyConfig(Config.Key.ENTER_KEYS)
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (upkeys) {
                upkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.upKeyEvent) {
                        this.upKeyEvent(document, keyMaps)
                    }
                })
            }
            if (downkeys) {
                downkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.downKeyEvent) {
                        this.downKeyEvent(document, keyMaps)
                    }
                })
            }
            if (rightkeys) {
                rightkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.rightKeyEvent) {
                        this.rightKeyEvent(document, keyMaps)
                    }
                })
            }
            if (leftkeys) {
                leftkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.leftKeyEvent) {
                        this.leftKeyEvent(document, keyMaps)
                    }
                })
            }
            if (enterkeys) {
                enterkeys.forEach((key: string) => {
                    if ((e.key == key || e.key == key.toLowerCase()) && this.enterKeyEvent) {
                        this.enterKeyEvent(document, keyMaps)
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
                    keyArray.push()
                    map.set(axisB,keyArray)
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
         *  DOMで指定したメソッドを実行する
         */
        public static executeKeyMapAction(document: Document, keyMaps: KeyMaps): void {
            // KeyConfigコールバック用の現在選択要素を特定する関数
            const getSelectedButton = () => {
                const node: Element | null = document.querySelector(
                    '[' + this.KEY_CONTROL_MAP_ATTRIBUTE + '].' + this.BUTTON_SELECT_CLASS_NAME
                )
                if (!node) {
                    return
                } 
                node.classList.remove(this.BUTTON_SELECT_CLASS_NAME)
                const attr = node.getAttribute(this.KEY_CONTROL_MAP_ATTRIBUTE)
                if (!attr) {
                    return
                }
                const xy = attr.split(',')
                return [parseInt(xy[0]), parseInt(xy[1])]
            }

            // 選択要素を切り替える関数
            const changeButton = (n: number, axis: string, keyMaps: KeyMaps) => {
                const xy = getSelectedButton()
                if (!xy) {
                    return
                }

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
                    return
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
                    return
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
            }

        }
    }
}