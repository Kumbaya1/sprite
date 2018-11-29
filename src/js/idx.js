import '../css/index.css'
import {Scene, Sprite} from 'spritejs'
const path = require('path');
//移除长按默认事件
window.addEventListener('touchstart', function (e) {
    e.preventDefault()
}, {passive: false});
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
            this.size = this.width / 10;

        } catch (e) {
            console.error(e)
        }
    }

    init({left = 10, top = 10, gap = 10, rowNum = 2} = {}) {
        for (let i = 0; i < this.chance; i++) {
            let row = Math.ceil((i + 1) / rowNum);  //第几行
            let col = i % rowNum + 1;               //第几列
            let pLeft = left + this.size / 2 + (gap + this.size) * (col - 1);
            let pTop = top + this.size / 2 + (gap + this.size) * (row - 1);
            console.log(pLeft, pTop);
            let s = new this.Sprite(require('../img/i1.png')).attr({
                anchor: 0.5,
                size: [this.size, this.size],
                pos: [pLeft, pTop],
            });
            this.layer.append(s)
            console.log(s)
            let _this = this;
            s.on('touchstart',function (evt) {
                console.log(evt)
                console.log(this)
                _this.sprittouchStart()
            })

        }
    }
    sprittouchStart(evt,s){
        // console.log(evt)
    }
    sprittouchMove(){

    }
    sprittouchEnd(){

    }
}

var Beans = new BeansGame({Scene: Scene, Sprite: Sprite});
Beans.init();
