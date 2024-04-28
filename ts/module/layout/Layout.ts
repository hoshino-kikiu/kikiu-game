import SassCompiler from "../util/SassCompiler";

/**
 * Layout.vueファイルを読み込みし、分解するためのクラス
 */
export default class Layout {

    private readonly HTML_TAG_NAME = "template"
    private readonly CSS_TAG_NAME = "style"

    private html: string | null = null
    private css: string | null = null

    constructor()
    constructor(layout: string)
    constructor(layout?: string) { 
        if (layout) {
            this.initHTML(layout)
            this.initCSS(layout)
        }
    }

    private initHTML(layout: string): void { 
        let html: string = ""
        const htmlRegexp: RegExp =
            new RegExp('< *?' + this.HTML_TAG_NAME + ' *?>(.*?)</ *?' + this.HTML_TAG_NAME + ' *?>',"s")
        const match = layout.match(htmlRegexp)
        if (match) { 
            html = match[1]
        }
        this.html = html
    }

    private initCSS(layout: string): void {
        let css: string = ""
        const cssRegexp: RegExp =
            new RegExp('< *?' + this.CSS_TAG_NAME + '.*?>(.*?)</ *?' + this.CSS_TAG_NAME + ' *?>', "s")
        const match = layout.match(cssRegexp)
        if (match) { 
            const isSass: boolean =
                new RegExp('< *?' + this.CSS_TAG_NAME + ' +?lang="(scss|sass)" *?>', "s").test(layout)
            css = isSass ? SassCompiler.getCssString(match[1]) : match[1]
        }
        this.css = css
    }

    public getHTML(): string {
        return this.html ? this.html : ""
    }

    public setHTML(htmlString: string): void { 
        this.html = htmlString
    }

    public getCSS(): string {
        return this.css ? this.css : ""
    }

    public setCSS(cssString: string): void { 
        this.css = cssString
    }

    public addCSS(cssString: string): void { 
        this.css += "\n" + cssString
    }
}