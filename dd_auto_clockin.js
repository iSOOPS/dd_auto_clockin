//定义操作时间
//如打卡时间为7:30～7:50 则为 [7,30,50] 范围时间建议提前5分钟，考虑到旧手机卡顿等情况，执行操作时间将会有1～3分钟的延迟
var target_times = [
    [7,40,55],
    [12,1,50],
    [14,40,55],
    [18,30,50]
]
//以下代码请勿修改
/*************************** function ***************************/

// 解锁屏幕
function unlock() {
    if(!device.isScreenOn()) {
        device.wakeUp();
        sleep(500);
        swipe(device.width / 2,device.height / 2,device.width / 2,device.height / 2 + 2000,1000);
        device.keepScreenOn()
        sleep(500);
    }
}

//开启app
function openApp() {
    console.log("打开APP")
    className("android.widget.TextView").text("钉钉").findOne().click();
    sleep(12000);
    console.log("进入任务窗口")
    recents();
    sleep(1000);
    console.log("关闭钉钉")
    id("dismiss_task").className("android.widget.ImageView").desc("移除钉钉。").findOne().click()
    sleep(1000);
    console.log("回到首页")
    home();
}

function actions(hour,min,send) {
    sleep(5000)
    console.log("开始APP操作")
    openApp();
    console.log("结束APP操作")
    sleep(500)
    console.log("结束执行操作")
}

function get_timestamp(hour,min) {
    var d = new Date();
    d.setHours(hour);
    d.setMinutes(min);
    d.setMilliseconds(0);
    return d.getTime() / 1000;
}

function get_random(max,min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*************************** function ***************************/

toast("开始脚本")

var time_list = [];

for(i in target_times) {
    //判断当前时间戳
    var timestamp = new Date().getTime() / 1000;
    //获取该设置开始时间戳
    var start_time = get_timestamp(target_times[i][0],target_times[i][1]);
    //获取该设置结束时间戳
    var end_time = get_timestamp(target_times[i][0],target_times[i][2]);

    //当前时间大于设置最大时间,忽略该设置,已过期设置
    if(timestamp >= end_time) {
        continue;
    }

    //若当前时间在设置范围内
    var sub_time = 0;
    if(timestamp < end_time && timestamp>=start_time ) {
        var d = new Date();
        var real_min = d.getMinutes() + 3;
        //获取当前时间,若3分钟后到达最大边界,忽略该设置,已过期设置
        if(real_min < target_times[i][1]) {
            continue;
        }
        //获取当前时间与最大时间的差,后续缩小获取随机数的范围
        sub_time = real_min - target_times[i][1]
    }
    //获取分钟随机数
    var random_min = get_random(target_times[i][2],target_times[i][1] + sub_time);
    //获取秒的随机数
    var random_send = Math.floor(Math.random() * 59) + 1;
    //构建对象
    var tc = {
        hour : target_times[i][0],
        min : random_min,
        send : random_send,
        did : false
    }
    time_list.push(tc);
    console.log("预执行时间:" + tc.hour + ":" + tc.min + ":" + tc.send)
}


while (true) {
    //获取当前时间的时分秒
    var nowDate = new Date();
    var hour = nowDate.getHours();
    var min = nowDate.getMinutes();
    var send = nowDate.getSeconds();
    //打印循环
    if (min % 30 == 0) {
        console.log("TimeLog:" + hour + ":" + min + ":" + send);
        for(i in target_times) {
            console.log("预执行时间:" + tc.hour + ":" + tc.min + ":" + tc.send)
        }
    }
    //判断是否全部被执行了
    var end = true;
    for(i in time_list) {
        var tc = time_list[i];
        //存在一个,继续保留
        if(tc.did == false) {
            end = false;
        }
    }
    //全部执行过,结束
    if(end == true) {
        toast("结束脚本")
        break
    }
    //遍历时间对象数组    
    for(i in time_list) {
        var tc = time_list[i];
        //若未执行且时间对的上,触发操作
        if(tc.did == false && tc.hour == hour && tc.min == min) {
            //增加2秒时间增加容错率
            if(send >= tc.send && send < (tc.send + 2)) {
                tc.did = true;
                //执行操作
                actions(hour,min,send);
            }
        }
    }
    sleep(1000)
}
