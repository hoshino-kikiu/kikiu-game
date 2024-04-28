import sass from "sass"

export default class SassCompiler {
    /**
     * layoutファイルから渡されたsass文字列をcssに変換する
     * 
     * @param sassStr 
     * @returns 
     */
    public static getCssString(sassStr: string): string { 
        const result: sass.CompileResult = sass.compileString(sassStr)
        return result.css
    }
}