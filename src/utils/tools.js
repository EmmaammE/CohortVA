/* eslint-disable */

export function debounce(func, wait) {
    var timeout;
    return function () {
        var context = this;
        var args = arguments;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(context, args)
        }, wait);
    }
}

// 深拷贝函数
export function deepClone(Obj) {   
    var buf;   
    if (Obj instanceof Array) {   
        buf = [];  //创建一个空的数组 
        var i = Obj.length;   
        while (i--) {   
            buf[i] = deepClone(Obj[i]);   
        }   
        return buf;   
    }else if (Obj instanceof Object){   
        buf = {};  //创建一个空对象 
        for (var k in Obj) {  //为这个对象添加新的属性 
            buf[k] = deepClone(Obj[k]);   
        }   
        return buf;   
    }else{   
        return Obj;   
    }   
}

export function genderTemplate(vKey,nodeDict){
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    if(words.length>3){
        return  `${words[0]}的${words[1]}${words[2]}`
    }else{
        return  words.join("-")
    }
}

export function genderTemplateEn(vKey,nodeDict){
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    if(words.length>3){
        return  `${words[0]}'s ${words[1]} ${words[2]}`
    }else{
        return  words.join("-")
    }
}

export function familyTemplate(vKey,nodeDict){
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    if(words.length==4){
        return  `${words[0]}的${words[1]}是${words[2]}`
    }else{
        return  words.join("-")
    }
}

export function familyTemplateEn(vKey,nodeDict){
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    if(words.length==4){
        return  `${words[0]}'s ${words[1]} is ${words[2]}`
    }else{
        return  words.join("-")
    }
}

export function socialDisTemplate(vKey,nodeDict){
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    if(words.length==4){
        return  `${words[0]}的${words[1]}${words[2]}`
    }else{
        return  words.join("-")
    }
}

export function socialDisTemplateEn(vKey,nodeDict){
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    if(words.length==4){
        return  `${words[0]}'s ${words[1]} ${words[2]}`
    }else{
        return  words.join("-")
    }
}
// 官职类型
export function titleTemplate(vKey,nodeDict){
    let result 
    let yearIndex = -1
    let nianHaoIndex = []
    let officeBelongIndex =-1
    let postWayIndex =-1
    let addressIndex =-1

   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    vKey.forEach((vk,i)=>{
        if(nodeDict[vk].label=="Year"&&yearIndex==-1){
            yearIndex = i
        }
        if(nodeDict[vk].label=="Nianhao"){
            nianHaoIndex.push(i)
        }
        if(nodeDict[vk].label=="OfficeBelong"&&officeBelongIndex==-1){
            officeBelongIndex = i 
        }
        if(nodeDict[vk].label=="PostIs"&&postWayIndex==-1){
            postWayIndex = i
        }
        //地点
        if(nodeDict[vk].label=="Where"){
            addressIndex = i 
        }
    })
    let lastYear = "none"
    if(officeBelongIndex!=-1){
        result = `${words[0]}于`
        nianHaoIndex.forEach(v=>{
            if((v-2)&&words[v-2]!=lastYear){
                if(lastYear!="none"){
                    result+=`)，`
                }
                lastYear = words[v-2]
                result+=`${(v-2)?words[v-2]:"xxxx"}年(年号:${nianHaoIndex?words[v]:"xx"}`
            }else if(words[v-2]==lastYear){
                result+=`，${nianHaoIndex?words[v]:"xx"}`
            }else{
                result+=`${(v-2)?words[v-2]:"xxxx"}年(年号:${nianHaoIndex?words[v]:"xx"})， `
            }
            
        })
        if(lastYear!="none"){
            result+=`), `
        }
        result+= `被授予${words[officeBelongIndex+1]}的${words[officeBelongIndex-1]}官职， `
        result+= `${postWayIndex?words[postWayIndex]:""}${postWayIndex?words[postWayIndex+1]:""}, `
        result+= `${addressIndex?words[addressIndex]:""} ${(addressIndex+1)?words[addressIndex+1]:""}, `
        result+= `${(words[addressIndex+2])?words[addressIndex+2]:""} ${(words[addressIndex+3])?words[addressIndex+3]:""}`
        return result 
    }
    return  words.join("-")
}

// 官职类型
export function titleTemplateEn(vKey,nodeDict){
    let result 
    let yearIndex = -1
    let nianHaoIndex = []
    let officeBelongIndex =-1
    let postWayIndex =-1
    let addressIndex =-1

   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    vKey.forEach((vk,i)=>{
        if(nodeDict[vk].label=="Year"&&yearIndex==-1){
            yearIndex = i
        }
        if(nodeDict[vk].label=="Nianhao"){
            nianHaoIndex.push(i)
        }
        if(nodeDict[vk].label=="OfficeBelong"&&officeBelongIndex==-1){
            officeBelongIndex = i 
        }
        if(nodeDict[vk].label=="PostIs"&&postWayIndex==-1){
            postWayIndex = i
        }
        //地点
        if(nodeDict[vk].label=="Where"){
            addressIndex = i 
        }
       
    })
    let lastYear = "none"
    if(officeBelongIndex!=-1){
        result = `${words[0]}, `
        nianHaoIndex.forEach(v=>{
            if((v-2)&&words[v-2]!=lastYear){
                if(lastYear!="none"){
                    result+=`), `
                }
                lastYear = words[v-2]
                result+=`${(v-2)?words[v-2]:"xxxx"} Year (Nianhao:${nianHaoIndex?words[v]:"xx"}`
            }else if(words[v-2]==lastYear){
                result+=`, ${nianHaoIndex?words[v]:"xx"}`
            }else{
                result+=`${(v-2)?words[v-2]:"xxxx"} Year (Nianhao:${nianHaoIndex?words[v]:"xx"}), `
            }
            
        })
        if(lastYear!="none"){
            result+=`), `
        }
        result+= `was granted the ${words[officeBelongIndex-1]} office position of ${words[officeBelongIndex+1]}，`
        result+= `${postWayIndex?words[postWayIndex]:""} ${postWayIndex?words[postWayIndex+1]:""}, `
        result+= `${addressIndex?words[addressIndex]:""} in ${(addressIndex+1)?words[addressIndex+1]:""}, `
        result+= `${(words[addressIndex+2])?words[addressIndex+2]:""} to ${(words[addressIndex+3])?words[addressIndex+3]:""}`
        return result 
    }
    return  words.join("-")
}

export function relationTemplate(vKey,nodeDict){
    let yearIndex = -1
    let occasionIndex = -1
    let result
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    vKey.forEach((vk,i)=>{
        if(nodeDict[vk].label=="Year"&&yearIndex==-1){
            yearIndex = i
        }
        if(nodeDict[vk].label=="Occasion"&&occasionIndex==-1){
            occasionIndex =i
        }
       
    })
     
    if(words.length>13){
        result =  `${words[0]}和${words[12]}的关系是${words[6]}中的"${words[4]}", 属于${words[8]}`
        if(yearIndex!=-1){
            result+=`，时间是: ${yearIndex?words[yearIndex]:""}年，${words[yearIndex+1]?words[yearIndex+1]:""}是${words[yearIndex+2]?words[yearIndex+2]:""}`
        }
        return result
    }
    return  words.join("-")
}

export function relationTemplateEn(vKey,nodeDict){
    let yearIndex = -1
    let occasionIndex = -1
    let result
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    vKey.forEach((vk,i)=>{
        if(nodeDict[vk].label=="Year"&&yearIndex==-1){
            yearIndex = i
        }
        if(nodeDict[vk].label=="Occasion"&&occasionIndex==-1){
            occasionIndex =i
        }
       
    })
     
    if(words.length>13){
        result =  `${words[0]} and ${words[12]}'s relationship is "${words[4]}" in ${words[6]}, which belongs to ${words[8]}`
        if(yearIndex!=-1){
            result+=`, time : ${yearIndex?words[yearIndex]:""} Year, ${words[yearIndex+1]?words[yearIndex+1]:""} is ${words[yearIndex+2]?words[yearIndex+2]:""}`
        }
        return result
    }
    return  words.join("-")
}

export function locationTemplate(vKey,nodeDict){
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    let result
    if(words.length>8){
        result = `${words[0]}的${words[2]}是${words[4]}、${words[6]}、${words[8]}。`
        if(words.length>10){
            result = `${result} ${words[10]}属于${words[12]}`
        }
    }else{
        result =   words.join("-")
    }
    return result
}

export function locationTemplateEn(vKey,nodeDict){
   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    let result
    if(words.length>8){
        result = `${words[0]}'s ${words[2]} is ${words[4]}、${words[6]}、${words[8]}。`
        if(words.length>10){
            result += `${result} ${words[10]} belong to ${words[12]}`
        }
    }else{
        result =   words.join("-")
    }
    return result
}

export function beOfficeTemplate(vKey,nodeDict){
    let result 
    let nianHaoIndex = []
    let entryWay = -1
    let entryWayBelong = -1
    let office = -1


   
    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    vKey.forEach((vk,i)=>{

        if(nodeDict[vk].label=="EntryEvent"&&office==-1){
            office = i
        }

        if(nodeDict[vk].label=="EntryIs"&&entryWay ==-1){
            entryWay = i
        }

        if(nodeDict[vk].label=="Entry_Belong"&&entryWayBelong ==-1){
            entryWayBelong = i
        }
        if(nodeDict[vk].label=="Nianhao"){
            nianHaoIndex.push(i)
        }

    })
    if(words.length>10){
        result = `${words[0]}做`
        if(office>-1&&words[office]!="EntryEvent"){
            result+=`${words[office]}`
        }else{
            result+="官"
        }
        
        result+=entryWay>-1? `，入仕方式是：${words[entryWay+1]}，` : ""
        result+= entryWayBelong>-1 ? `属于：${words[entryWayBelong+1]}，`:""

        let lastYear = "none"
        nianHaoIndex.forEach(v=>{
            if((v-2)&&words[v-2]!=lastYear){
                if(lastYear!="none"){
                    result+=`)，`
                }
                lastYear = words[v-2]
                result+=`${(v-2)?words[v-2]:"xxxx"}年(年号：${nianHaoIndex?words[v]:"xx"}`
            }else if(words[v-2]==lastYear){
                result+=`, ${nianHaoIndex?words[v]:"xx"}`
            }else{
                result+=`${(v-2)?words[v-2]:"xxxx"}年(年号：${nianHaoIndex?words[v]:"xx"})， `
            }  
        })
        if(lastYear!="none"){
            result+=`)`
        }
        
        return result
    }else{
        return  words.join("-")
    }
    
}

export function beOfficeTemplateEn(vKey,nodeDict){
    let result 
    let nianHaoIndex = []
    let entryWay = -1
    let entryWayBelong = -1
    let office = -1


    let words = vKey.map(item=>{
        return nodeDict[item]['en_name']? nodeDict[item]['en_name']:nodeDict[item]['label'];
    });
    vKey.forEach((vk,i)=>{

        if(nodeDict[vk].label=="EntryEvent"&&office==-1){
            office = i
        }

        if(nodeDict[vk].label=="EntryIs"&&entryWay ==-1){
            entryWay = i
        }

        if(nodeDict[vk].label=="Entry_Belong"&&entryWayBelong ==-1){
            entryWayBelong = i
        }
        if(nodeDict[vk].label=="Nianhao"){
            nianHaoIndex.push(i)
        }


    })
    if(words.length>10){
        result = `${words[0]} be`
        if(office>-1&&words[office]!="EntryEvent"){
            result+=`${words[office]}`
        }else{
            result+=" an office"
        }
        
        result+=entryWay>-1? `, by means of ${words[entryWay+1]}，` : ""
        result+= entryWayBelong>-1 ? `belong to ：${words[entryWayBelong+1]}, `:""

        let lastYear = "none"
        nianHaoIndex.forEach(v=>{
            if((v-2)&&words[v-2]!=lastYear){
                if(lastYear!="none"){
                    result+=`)，`
                }
                lastYear = words[v-2]
                result+=`${(v-2)?words[v-2]:"xxxx"} Year (Nianhao：${nianHaoIndex?words[v]:"xx"}`
            }else if(words[v-2]==lastYear){
                result+=`, ${nianHaoIndex?words[v]:"xx"}`
            }else{
                result+=`${(v-2)?words[v-2]:"xxxx"} Year (Nianhao：${nianHaoIndex?words[v]:"xx"}), `
            }  
        })
        if(lastYear!="none"){
            result+=`)`
        }
        
        return result
    }else{
        return  words.join("-")
    }
    
}