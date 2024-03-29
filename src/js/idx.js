import '../css/index.css'
import { Scene, Sprite, Label } from 'spritejs'
const path = require('path');
//移除长按默认事件
window.addEventListener('touchstart', function (e) {
    e.preventDefault()
}, { passive: false });
document.oncontextmenu = function () { return false; }
/*
*   chance 可用次数
*   victory 胜利次数
*   range 达成条件的范围
*   sizeGap 每次力度增加最小单位
*   active 力度条状态
*   timeGap 每次力度变化时的时间最小间隔
*   beansActive touch时保存豆的初始状态
*   machine 豆浆机实例
*   areaRange 吃豆范围
*   isEatBeans 当前是否可以吃豆
*   condition 达成胜利条件次数
*/
class BeansGame {
    constructor({
        el = "body",
        Scene,
        Sprite,
        Label,
        chance = 3,
        victory = 0,
        range = [0.674, 1],
        sizeGap = 0.07,
        condition = 3,
        active = { flag: "up", defaultSize: 0, activeSize: 0, maxSizeNum: null },
        timeGap = 50
    }) {
        try {
            this.el = el;
            this.sceneInstance = new Scene(el);
            this.Sprite = Sprite;
            this.layer = this.sceneInstance.layer();
            this.Label = Label;
            this.chance = chance;
            this.victory = victory;
            this.range = range;
            this.sizeGap = sizeGap;
            this.condition = condition;
            this.active = active;
            this.timer = null;
            this.timeGap = timeGap;
            this.width = this.layer.resolution[0];
            this.height = this.layer.resolution[1];
            this.size = this.width / 4;
            this.beansActive = { pos: [] };
            this.machine = { instance: null, pos: [] };
            this.areaRange = {};
            this.isEatBeans = false;
            this.powerProgess = null;
            this.stars = [];
            this.beans = null;
            this.tipLable = null;
            this.timerMachine = null;
            this.powerProgessBorder = null;

        } catch (e) {
            console.error(e)
        }
    }

    init({ left = 10, top = 10, gap = 10, rowNum = 2 } = {}) {
        //绘制logo
        let logo = new this.Sprite(require('../img/logo.png')).attr({
            anchor: [0, 0],
            size: [this.width * 0.5, this.width * 0.5 * 0.15],
            pos: [10, 30],
            zIndex: 0
        })
        this.layer.append(logo);
        //绘制豆子
        // this.drawBeans({ left =left, top = top, gap = gap, rowNum = rowNum } = {});
        //绘制豆浆机
        let machine = new this.Sprite(require('../img/1.png')).attr({
            anchor: [0.5, 1],
            size: [this.width * 0.8, this.width * 0.8],
            pos: [this.width / 2, this.height - this.width * 0.26],
            zIndex: 0
        })
        this.machine.instance = machine;
        this.machine.pos = machine.xy;
        this.layer.append(machine)
        let xy = machine.xy;
        let attrSize = machine.attrSize;
        let mleft = xy[0] - attrSize[0] / 2 + attrSize[0] * 0.2;
        let mRight = mleft + attrSize[0] - attrSize[0] * 0.2;
        let mtop = xy[1] - attrSize[1] / 2 + attrSize[1] * 0.16;
        let mBottom = mtop + attrSize[0] - attrSize[1] * 0.5;
        this.areaRange = {
            x: [mleft, mRight],
            y: [mtop, mBottom]
        };
        //绘制力度条边框
        const posProgess = {
            pos: [this.width - 30, 20],
            size: [20, this.height * 0.3]
        };
        let powerProgessBorder = new Sprite({
            anchor: [0.5, 0],
            // bgcolor: '#f2c988',
            textures: require("../img/progess.png"),
            pos: posProgess.pos,
            size: posProgess.size,
            // size: [42,238],
            // borderRadius: 50,
            // opacity: .6,
            // shadow: {
            //     blur: 8,
            //     color: '#eee',
            //     offset: [5, 5],
            // },
            // border: {
            //     style: [5, 0],
            //     width: 5,
            //     color: '#fdebcb',
            // },
            // boxSizing: 'border-box',
            zIndex: 0
        })
        this.layer.append(powerProgessBorder);
        this.powerProgessBorder = powerProgessBorder;
        //绘制力度条
        let powerProgess = new Sprite({
            anchor: [0.5, 1],
            bgcolor: "#fae6bb",
            // bgcolor: {
            //     vector: [0, 0, 200, 200],
            //     colors: [
            //         {color: '#fae6bb', offset: 1},
            //         {color: '#fe8787', offset: 0},
            //     ]
            // },
            pos: [posProgess.pos[0], posProgess.pos[1] + posProgess.size[1] - 10],
            size: [posProgess.size[0] - 12, posProgess.size[1] * this.active.defaultSize - 5],
            borderRadius: 60,
            zIndex: 1
        })
        this.active.maxSizeNum = posProgess.size[1] * 0.93;
        this.powerProgess = powerProgess;
        this.layer.append(powerProgess)
        //绘制按钮
        let powerBtn = new Sprite(require("../img/pick_me.png")).attr({
            anchor: 0.5,
            pos: [this.width / 2, this.height * 0.92],
            size: [this.width / 3, this.width / 3 * 0.28],
            borderRadius: 50,
        })
        this.layer.append(powerBtn)
        powerBtn.on('touchstart', (evt) => { this.btnTouchStart(powerBtn, evt, this, powerProgess) })
        powerBtn.on('touchend', (evt) => { this.btnTouchEnd(powerBtn, evt, this, powerProgess) })
        //绘制星星
        this.drawStar();
        //默认提示
        this.tipLable = new this.Label();
        this.tipLable.attr({
            anchor: [0, 0],
            fillColor: '#f37',
            pos: [10, this.width * 0.2 + this.width * 0.5 * 0.15 + 40],
            font: '22px "宋体"',
            lineBreak: 'normal',
            border: [0, '#aaa'],
            zIndex: 999,
            textAlign: "center",
        })
        this.layer.append(this.tipLable)
        this.showTip();
    }
    //初始化豆子
    drawBeans({ left = 10, top = 10, gap = 10, rowNum = 2 } = {}) {
        this.beans ? this.beans.remove() : '';
        this.beansActive.pos = [left + this.size / 2, this.size * 1.18 / 2 + top];  // 存储开始拖拽时的位置
        let s = new this.Sprite(require('../img/beans.png')).attr({
            anchor: [0.5, 0.5],
            size: [this.size, this.size * 1.18],
            pos: this.beansActive.pos,
            zIndex: 1
        });
        this.layer.append(s)
        this.beans = s;
        let _self = this;
        s.on('touchstart', (evt) => { _self.spriteTouchStart(s, evt, _self) })
        // this.beans.forEach(i => { i.remove() });
        // this.beans = [];
        // for (let i = 0; i < this.chance; i++) {
        //     let row = Math.ceil((i + 1) / rowNum);  //第几行
        //     let col = i % rowNum + 1;               //第几列
        //     let pLeft = left + this.size / 2 + (gap + this.size) * (col - 1);
        //     let pTop = top + this.size / 2 + (gap + this.size) * (row - 1);
        //     let s = new this.Sprite(require('../img/i1.png')).attr({
        //         anchor: 0.5,
        //         size: [this.size, this.size],
        //         pos: [pLeft, pTop],
        //         zIndex: 1
        //     });
        //     this.layer.append(s)
        //     this.beans.push(s);
        //     let _self = this;
        //     s.on('touchstart', (evt) => { _self.spriteTouchStart(s, evt, _self) })
        // }
    }
    //初始化星星
    drawStar() {
        this.stars.forEach(i => { i.remove() });
        this.stars = [];
        for (let i = 0; i < this.condition; i++) {
            let s = new this.Sprite(require('../img/star_normal.png')).attr({
                anchor: 0,
                size: [this.width * 0.12, this.width * 0.12],
                pos: [10 + i * this.width * 0.15, this.width * 0.5 * 0.15 + 40],
                zIndex: 0,
                // textures: require("../img/star.png"),
            })
            this.layer.append(s)
            this.stars.push(s)
        }

    }
    //提示信息
    showTip({ text = "还剩3次机会" } = {}) {
        this.tipLable.attr({
            text: text
        })
    }
    //力度按钮按下
    btnTouchStart(context, evt, _self, target) {

        this.resetPowerProgess();
        if (!_self.isEatBeans) {
            if (this.timerMachine === null) {
                let numImg = 21;
                let count = 1;
                this.timerMachine = setInterval(() => {
                    count++;
                    count == 21 ? count = 13 : '';
                    this.machine.instance.attr({
                        textures: require(`../img/${count}.png`)
                    })
                }, 50)
            }
            _self.changePowerProgess(_self, target);
        }
    }
    //力度按钮松开
    btnTouchEnd(context, evt, _self, target) {
        if (!_self.isEatBeans) {
            clearInterval(this.timerMachine);
            this.timerMachine = null;
            clearInterval(_self.timer)
            this.machine.instance.attr({
                textures: require(`../img/1.png`)
            })
            _self.chance--;
            this.showTip({ text: `还剩${_self.chance}次机会` });
            if (_self.active.activeSize >= _self.range[0] && _self.active.activeSize <= _self.range[1]) {
                // console.log("one times win");
                _self.victory++;
                _self.stars[_self.victory - 1].attr({
                    textures: require("../img/star.png")
                })
                _self.chance != 0 ? this.chanceOverShowTip() : '';
            } else {
                _self.chance != 0 ? this.chanceOverShowTip({ f: "fail" }) : '';

            }
            if (_self.victory >= _self.condition) {
                this.gameVistory();
                // console.log("达成条件")
            } else {
                if (_self.chance == 0) {
                    this.chanceOver();
                    // console.log('chance is over')
                } else {
                    // this.drawBeans();
                }
            }
            _self.isEatBeans = false;
        }
    }
    //重置力度条进度状态
    resetPowerProgess() {
        this.active.flag = "up";
        this.active.activeSize = 0;
        // active = { flag: "up", defaultSize: 0, activeSize: 0, maxSizeNum: null },

        this.powerProgess.attr({
            size: [this.powerProgess.attr("size")[0], this.active.defaultSize * this.active.maxSizeNum]
        })
    }
    //豆子事件
    spriteTouchStart(context, evt, _self) {
        evt.stopDispatch();
        // console.log('spriteTouchStart')
        if (_self.isEatBeans) {
            // _self.beansActive.pos = [evt.layerX, evt.layerY];  // 存储开始拖拽时的位置
            context.on('touchmove', (evt) => { _self.spriteTouchMove(context, evt, _self) })
        }
    }
    spriteTouchMove(context, evt, _self) {
        evt.stopDispatch();
        // console.log('spriteTouchMove')
        // console.log(evt)
        context.attr({
            pos: [evt.layerX, evt.layerY]
        })
        context.on('touchend', (evt) => { _self.spriteTouchEnd(context, evt, _self) })
        // context.on('touchend',_self.debounce(_self.spriteTouchEnd,3000))
    }
    spriteTouchEnd(context, evt, _self) {
        evt.stopDispatch();
        let layerX = evt.layerX;
        let layerY = evt.layerY;
        if (_self.areaRange.x[0] < layerX && _self.areaRange.x[1] > layerX && _self.areaRange.y[0] < layerY && _self.areaRange.y[1] > layerY) {
            // console.log('吃到豆了')
            _self.isEatBeans = false;
            context.remove();
            this.resetPowerProgess();
        } else {
            context.attr({
                pos: _self.beansActive.pos
            })
        }
        // console.log(evt)

    }
    //力度条状态变化
    changePowerProgess(_self, target) {
        // let active = _self.active;
        // active = { flag: "up", defaultSize: 0.2, activeSize: 0.2 ,maxSizeNum},
        // let target.
        _self.timer = setInterval(() => {
            if (_self.active.flag === "up") {
                if (_self.active.activeSize < 1) {
                    // _self.active.activeSize += _self.sizeGap;
                    _self.active.activeSize + _self.sizeGap > 1 ? _self.active.activeSize = 1 : _self.active.activeSize += _self.sizeGap;
                    target.attr({
                        size: [target.attr('size')[0], _self.active.activeSize * _self.active.maxSizeNum - 5]
                    })
                    // console.log(target.attr('size'))
                } else {
                    _self.active.flag = "down";
                    _self.active.activeSize = 1 - _self.sizeGap;
                    target.attr({
                        size: [target.attr('size')[0], _self.active.activeSize * _self.active.maxSizeNum - 5]
                    })
                }
                _self.sizeGap

            } else {
                if (_self.active.activeSize > _self.active.defaultSize) {
                    _self.active.activeSize - _self.sizeGap < 0 ? _self.active.activeSize = 0 : _self.active.activeSize -= _self.sizeGap;
                    target.attr({
                        size: [target.attr('size')[0], _self.active.activeSize * _self.active.maxSizeNum - 5]
                    })
                } else {
                    _self.active.flag = "up";
                    _self.active.activeSize = _self.sizeGap;
                    target.attr({
                        size: [target.attr('size')[0], _self.active.activeSize8 * _self.active.maxSizeNum - 5]
                    })
                }
            }
        }, _self.timeGap)
        // console.log(target)

    }
    //游戏胜利
    gameVistory() {
        this.gameOverShotTip();
        // let s = new this.Sprite({
        //     anchor: [0.5, 0.5],
        //     bgcolor: '#000000',
        //     pos: [this.width / 2, this.height / 2],
        //     size: [this.width, this.height],
        //     zIndex: 999,
        //     opacity: .7,
        //     textures:require("../img/success_bg.png")
        // })
        // let face = new this.Sprite(require("../img/success_face.png"));
        // face.attr({
        //     anchor: 0.5,
        //     pos: [this.width / 2, this.height / 2],
        //     size:[],
        //     zIndex: 999,

        // })
        // this.layer.append(s)
        // this.layer.append(face)
        // s.on('touchstart', evt => { evt.stopDispatch(); })
        // s.on('touchend', evt => {
        //     s.remove();
        //     face.remove();
        //     this.resetGame();
        //     evt.stopDispatch();
        // })
    }
    //游戏结束
    gameOverShotTip({ f = "quan" } = {}) {
        let s = new this.Sprite({
            anchor: [0.5, 0.5],
            bgcolor: '#000000',
            pos: [this.width / 2, this.height / 2],
            size: [this.width, this.height],
            zIndex: 999,
            opacity: .7,
            textures: require("../img/success_bg.png")
        })
        let face = new this.Sprite(require(`../img/${f}.png`));
        face.attr({
            anchor: 0.5,
            pos: [this.width / 2, this.height / 2],
            size: [],
            zIndex: 999,

        })
        this.layer.append(s)
        this.layer.append(face)
        s.on('touchstart', evt => { evt.stopDispatch(); })
        s.on('touchend', evt => {
            s.remove();
            face.remove();
            this.resetGame();
            evt.stopDispatch();
        })
    }
    //次数耗光、游戏失败
    chanceOver() {
        this.gameOverShotTip({ f: "fail" })
        // let s = new this.Sprite({
        //     anchor: [0.5, 0.5],
        //     bgcolor: '#000000',
        //     pos: [this.width / 2, this.height / 2],
        //     size: [this.width, this.height],
        //     zIndex: 999,
        //     opacity: .7
        // })
        // let label = new this.Label("失败\n点击任意处重新开始");
        // label.attr({
        //     anchor: 0.5,
        //     fillColor: '#f37',
        //     pos: [this.width / 2, this.height / 2],
        //     font: '22px "宋体"',
        //     // width: 280,
        //     lineBreak: 'normal',
        //     border: [0, '#aaa'],
        //     zIndex: 999,
        //     textAlign: "center"
        // })
        // this.layer.append(s)
        // this.layer.append(label)
        // s.on('touchstart', evt => { evt.stopDispatch(); })
        // s.on('touchend', evt => {
        //     s.remove();
        //     label.remove();
        //     this.resetGame();
        //     evt.stopDispatch();
        // })
    }
    chanceOverShowTip({ f = "success" } = {}) {
        let s = new this.Sprite({
            anchor: [0.5, 0.5],
            bgcolor: '#000000',
            pos: [this.width / 2, this.height / 2],
            size: [this.width, this.height],
            zIndex: 999,
            opacity: .7,
            textures: require("../img/success_bg.png")
        })
        let face = new this.Sprite(require(`../img/${f}_face.png`));
        face.attr({
            anchor: 0.5,
            pos: [this.width / 2, this.height / 2],
            size: [],
            zIndex: 999,

        })
        this.layer.append(s)
        this.layer.append(face)
        s.on('touchstart', evt => { evt.stopDispatch(); })
        s.on('touchend', evt => {
            s.remove();
            face.remove();
            evt.stopDispatch();
        })
    }
    //游戏重置
    resetGame() {
        this.chance = 3;
        this.victory = 0;
        this.resetPowerProgess();
        // this.drawBeans();
        this.drawStar();
        this.showTip();

    }
    debounce(method, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                method.apply(context, args);
            }, delay);
        }
    }
}

var Beans = new BeansGame({ Scene: Scene, Sprite: Sprite, Label: Label });
Beans.init();
