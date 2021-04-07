import Vue from 'vue'
export default function tzTimeFormatter (dateTime) {
    if (typeof dateTime == "string") {
        dateTime = dateTime.replace('T', ' ');
    }
    let date = new Date(dateTime);
    let d = new Date(date.getTime()+8*3600*1000);
    let year = d.getFullYear();
    let month = (d.getMonth()+1)+"";
    let da = d.getDate()+"";
    let hour = d.getHours()+"";
    let miu = d.getMinutes()+"";
    let sec = d.getSeconds()+"";
    return year+"-"+(month.length==1?"0"+month:month)+"-"+(da.length==1?"0"+da:da)+" "+(hour.length==1?"0"+hour:hour)+":"+(miu.length==1?"0"+miu:miu)+":"+(sec.length==1?"0"+sec:sec);
}

