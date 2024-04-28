import fs from "fs";
import Layout from "./Layout"

interface CommonDto { 
    name: string,
    extension: string
}

export default class LayoutRender{
    private readonly PATH: string = "./../res/activity/"
    private DEFAULT_LAYOUT_FILE_NAME: string = "/Layout.vue";
    private readonly EXTENSIONS: Array<string> = [".vue"]
    private readonly MAX_RECURSION_COUNT: number = 5

    private baseLayout: Layout
    private activityName: string
    private commons: Array<CommonDto> = []

    constructor(activityName: string) { 
        this.baseLayout = new Layout(fs.readFileSync(this.PATH + activityName + this.DEFAULT_LAYOUT_FILE_NAME, "utf-8"))
        this.activityName = activityName
        const files = fs.readdirSync(this.PATH + "common")
        files.forEach(file => {
            this.EXTENSIONS.forEach((extension) => { 
                if (file.slice(extension.length * -1).match(extension)) {
                    this.commons.push(
                        {
                            name: file.slice(0, extension.length * -1),
                            extension
                        }
                    )
                }
            })
        });
    }

    public render(): Layout{ 
        let commonExists = true
        let recursionCount = 0
        while (commonExists) {
            commonExists = this.joinCommonFile()
            recursionCount++
            if (this.MAX_RECURSION_COUNT <= recursionCount) { 
                console.log(this.activityName + "のLayoutは再帰呼び出し上限に達しました。")
                break
            }
        }
        return this.baseLayout
    }

    private joinCommonFile(): boolean { 
        let commonExists: boolean = false
        this.commons.forEach((common) => { 
            const commonRegexp: RegExp = new RegExp('< *?' + common.name + ' *?/>')
            const match = this.baseLayout.getHTML().match(commonRegexp)
            if (match) { 
                commonExists = true
                const commonLayoutString = fs.readFileSync(this.PATH + "common/" + common.name + common.extension, "utf-8")
                const commonLayout: Layout = new Layout(commonLayoutString)
                this.baseLayout.setHTML(this.baseLayout.getHTML().replace(commonRegexp, commonLayout.getHTML()))
                this.baseLayout.addCSS(commonLayout.getCSS())
            }
        })
        return commonExists
    }
}