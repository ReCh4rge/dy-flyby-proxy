import { ref, computed } from "vue";
import { Ex_WebSocket_UnLogin } from "@/global/utils/websocket.js"
import { STT } from "@/global/utils/stt.js"
import { getStrMiddle } from "@/global/utils"

export function useWebsocket(options) {
    let ws = null;
    let stt = new STT();
    let danmakuList = ref([]);
    let enterList = ref([]);
    let giftList = ref([]);

    const connectWs = (rid) => {
        if (rid === "") {
            return;
        }
        ws = new Ex_WebSocket_UnLogin(rid, (msg) => {
            handleMsg(msg);
        }, () => {
            // 重连
            ws.close();
            ws = null;
            connectWs();
        });
    }

    const handleMsg = (msg) => {
        let msgType = getStrMiddle(msg, "type@=", "/");
        if (!msgType) {
            return;
        }

        let data = stt.deserialize(msg);
        if (msgType === "chatmsg" && options.value.switch.includes("danmaku")) {
            let obj = {
                nn: data.nn, // 昵称
                avatar: data.ic, // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
                lv: data.level, // 等级
                txt: data.txt, // 弹幕内容
                color: data.col, // 弹幕颜色 undefine就是普通弹幕 2蓝色 3绿色 6粉色 4橙色 5紫色 1红色
                fansName: data.bnn, // 粉丝牌名字
                fansLv: data.bl, // 粉丝牌等级
                zf: data.diaf, // 是否是钻粉
                noble: data.nl, // 贵族等级
                nobleC: data.nc, // 贵族弹幕是否开启，1开
                tt: data.cst, // 时间戳
            };
            if (danmakuList.value.length + 1 > options.value.threshold) {
                danmakuList.value.shift();
            }
            danmakuList.value.push(obj);
        }
        if (msgType === "dgb" && options.value.switch.includes("gift")) {
            // console.log(data);
        }
        // if (msgType === "uenter" && options.value.switch.includes("enter")) {
        //     console.log(data);
        // }
    }

    return { connectWs, danmakuList }
}