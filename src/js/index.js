import '../css/index.css'
import {Scene, Sprite} from 'spritejs'
//移除长按默认事件
window.addEventListener('touchstart', function (e) {
    e.preventDefault()
}, {passive: false});
//设备类型
// function fIsMobile(){
//     return /Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(navigator.userAgent);
// }
//判断pc，mobile
// function systemType() {
//     var system ={
//         win : false,
//         mac : false,
//         xll : false
//     };
//     //检测平台
//     var p = navigator.platform;
//     system.win = p.indexOf("Win") == 0;
//     system.mac = p.indexOf("Mac") == 0;
//     system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
//
//     if(system.win||system.mac||system.xll){
//         //PC端
//         return 'pc'
//     }else{
//         //移动端跳转的链接
//         return 'mobile'
//     }
// }
// document.oncontextmenu=function(){return false;}
/*
*   chance 可用次数
*   victory 胜利次数
*   range 达成条件的范围
*   sizeGap 每次力度增加最小单位
*   active 力度条状态
*   timeGap 每次力度变化时的时间最小间隔
*/
class BeansGame {
    constructor({
                    el = "body",
                    Scene,
                    Sprite,
                    chance = 3,
                    victory = 0,
                    range = [0.95, 1],
                    sizeGap = 0.03,
                    active = {flag: "up", defaultSize: 0.2, activeSize: 0.2},
                    timeGap = 100
                }) {
        try {
            this.el = el;
            this.sceneInstance = new Scene(el);
            this.Sprite = Sprite;
            this.layer = this.sceneInstance.layer();
            this.chance = chance;
            this.victory = victory;
            this.range = range;
            this.sizeGap = sizeGap;
            this.active = active;
            this.timer = null;
            this.timeGap = timeGap;
            this.width = this.layer.resolution[0];
            this.height = this.layer.resolution[1];
        } catch (e) {
            console.error(e)
        }
    }
    init() {


    }
}

var Beans = new BeansGame({Scene:Scene,Sprite: Sprite});
const scene = new Scene('#demo-quickStart');
const layer = scene.layer();
const [deviceWidth, deviceHeight] = layer.resolution;
console.log(layer.resolution)
let intensity = {flag: 'up', size: 20, defaultSize: 20};
let timer;
let range = [(deviceHeight / 2) * 0.95, deviceHeight / 2];
let chance = 3;
let victory = 0;
console.log(deviceWidth, deviceHeight)
let opt = {
    opportunity: [new Sprite({
        anchor: 0.5,
        bgcolor: '#EEEE00',
        pos: [20, deviceHeight - 20],
        size: [20, 20],
        borderRadius: 50,
    }), new Sprite({
        anchor: 0.5,
        bgcolor: '#EEEE00',
        pos: [60, deviceHeight - 20],
        size: [20, 20],
        borderRadius: 50,
    }), new Sprite({
        anchor: 0.5,
        bgcolor: '#EEEE00',
        pos: [40, deviceHeight - 40],
        size: [20, 20],
        borderRadius: 50,
    })],
    result: [
        new Sprite({
            anchor: 0.5,
            bgcolor: '#ccc',
            pos: [deviceWidth - 20, deviceHeight - 20],
            size: [20, 20],
            borderRadius: 50,
        }),
        new Sprite({
            anchor: 0.5,
            bgcolor: '#ccc',
            pos: [deviceWidth - 60, deviceHeight - 20],
            size: [20, 20],
            borderRadius: 50,
        }),
        new Sprite({
            anchor: 0.5,
            bgcolor: '#ccc',
            pos: [deviceWidth - 40, deviceHeight - 40],
            size: [20, 20],
            borderRadius: 50,
        })
    ],
    powerSymbol: new Sprite({
        anchor: [0.5, 1],
        bgcolor: '#EE2C2C',
        pos: [deviceWidth / 2, deviceHeight / 3 * 2],
        size: [20, intensity.defaultSize],
        borderRadius: 50,

    }),
    powerSymbolBox: new Sprite({
        anchor: [0.5, 1],
        bgcolor: 'transparent',
        pos: [deviceWidth / 2, deviceHeight / 3 * 2],
        size: [26, deviceHeight / 2],
        borderRadius: 50,
        border: {
            style: [10, 0],
            width: 6,
            color: '#aaa',
        },
        boxSizing: 'border-box'
    }),
    powerButton: new Sprite({
        anchor: 0.5,
        bgcolor: 'green',
        pos: [deviceWidth / 2, deviceHeight * 3 / 4 + 50],
        size: [50, 50],
        borderRadius: 50,
    })
};
opt.opportunity.forEach(i => {
    layer.append(i)
});
opt.result.forEach(i => {
    layer.append(i)
});
layer.append(opt.powerSymbol)
layer.append(opt.powerButton)
layer.append(opt.powerSymbolBox)
let sizeGap = 3;

function con(e) {
    console.log(e)
}

opt.powerButton.on('touchstart', (evt) => {
    // evt.stopPropagation();
    evt.preventDefault();
    con(evt)
    if (chance <= 0) {
        alert('你已经没机会了');
        timer = null;
        return;
    }
    chance--;
    opt.opportunity[2 - chance].attr({
        bgcolor: "#ccc"
    });
    opt.powerButton.attr('border', [4, 'blue']);
    timer = setInterval(() => {
        if (intensity.flag === 'up') {
            intensity.size += sizeGap;
            if (intensity.size >= deviceHeight / 2) {
                intensity.flag = 'down';
            }
        } else if (intensity.flag === 'down') {
            intensity.size -= sizeGap;
            if (intensity.size < intensity.defaultSize) {
                intensity.flag = 'up';
            }
        }
        opt.powerSymbol.attr({
            size: [20, intensity.size]
        })
    }, 5)
});
opt.powerButton.on('touchend', (evt) => {
    evt.preventDefault();
    if (timer === null) {
        return;
    }
    opt.powerButton.attr('border', [0, '']);
    window.clearInterval(timer);
    if (range[0] <= intensity.size && range[1] >= intensity.size) {
        setTimeout(function () {
            victory++;
            if (victory != 3) {
                alert('you are win')
            } else {
                alert("你获得了购物券")
            }
            opt.result[victory - 1].attr({
                bgcolor: "#EE2C2C"
            })
        }, 100)
    } else {
        setTimeout(function () {
            alert('you are lose')
        }, 100)
    }
});




