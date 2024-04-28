import StringDto from "../model/activity/StringModel"
import { XMLParser } from "fast-xml-parser";

export default class XmlParser { 
    /**
     * stringのxmlファイルで指定した属性をDtoに詰め直し、不要な属性を排除する。
     * 
     * @param XmlStrings 
     * @returns 
     */
    public static convertXmlStringsToStringList(XmlStrings: string): Array<StringDto> { 
        const stringList: Array<StringDto> = []

        const dataKey = "@_data"
        const textKey = "#text"
        const colorKey = "@_color"

        const strings: Array<Object> = new XMLParser({ ignoreAttributes: false }).parse(XmlStrings).strings.string
        strings.forEach((stringObj: any) => {
            if (dataKey in stringObj) {
                const text: string = textKey in stringObj ? stringObj[textKey] : ""
                const color: string = colorKey in stringObj ? stringObj[colorKey] : null                
                const stringDto: StringDto = {
                    data: stringObj[dataKey]
                    ,text
                    ,color
                }
                stringList.push(stringDto)
            }
        })
        return stringList
    }

    public static parse(XmlString: string) {
        return new XMLParser().parse(XmlString)
    }
}