import { db } from '../database/db';
import {genderTemplate,
    familyTemplate,
    socialDisTemplate,
    titleTemplate,
    relationTemplate,
    locationTemplate,
    beOfficeTemplate,
    genderTemplateEn,
    familyTemplateEn,
    socialDisTemplateEn,
    titleTemplateEn,
    relationTemplateEn,
    locationTemplateEn,
    beOfficeTemplateEn,
    } from './tools'
// KEY表示中英文
// vKey表示所有word_id的集合
// nodeEdgeDict就是extract_features里面的id2node
// sentenceLabel就是一个sentence
// tempDict是一个类似于{id:name}对应的nodedict
const Template = (sentenceLabel,vKey, KEY,nodeEdgeDict) => {
    let senDiscription;
    if(KEY === "name"){
        // 中文版本的模板
        switch (sentenceLabel) {
            case "性别":
                senDiscription = genderTemplate(vKey,nodeEdgeDict )
                break;
            case "亲属":
                senDiscription = familyTemplate(vKey,nodeEdgeDict )
                break;
            case "社会区分":
                senDiscription = socialDisTemplate(vKey,nodeEdgeDict )
                break;
            case "官职":
                senDiscription = titleTemplate(vKey,nodeEdgeDict )
                break;
            case "关系":
                senDiscription = relationTemplate(vKey,nodeEdgeDict )
                break;
            case "籍贯":
            case "地点事件":
                senDiscription = locationTemplate(vKey,nodeEdgeDict )
                break;
            case "入仕":
                senDiscription = beOfficeTemplate(vKey,nodeEdgeDict )
                break;
            default:
                // console.log('noTemplate', sentenceLabel)
                senDiscription = vKey.join('-')
                break;
        }
    }else{
        // 英文版本的模板
        switch (sentenceLabel) {
            case "性别":
                senDiscription = genderTemplateEn(vKey,nodeEdgeDict )
                break;
            case "亲属":
                senDiscription = familyTemplateEn(vKey,nodeEdgeDict )
                break; 
            case "社会区分":
                senDiscription = socialDisTemplateEn(vKey,nodeEdgeDict )
                break;
            case "官职":
                senDiscription = titleTemplateEn(vKey,nodeEdgeDict )
                break;
            case "关系":
                senDiscription = relationTemplateEn(vKey,nodeEdgeDict )
                break;
            case "籍贯":
            case "地点事件":
                senDiscription = locationTemplateEn(vKey,nodeEdgeDict )
                break;
            case "入仕":
                senDiscription = beOfficeTemplateEn(vKey,nodeEdgeDict )
                break;
            default:
                senDiscription = vKey.join('-')
                break;
        }
    }
    return  senDiscription ;
}

const generate = async (sentenceLabel, vKey, KEY) => {
    const res = await db.node.bulkGet(vKey);
    const dict = res.reduce((acc, cur) => {
        acc[cur.id] = cur;
        return acc;
    }, {})

    return Template(sentenceLabel,vKey, 'en_name',dict)
}
 
export default generate;