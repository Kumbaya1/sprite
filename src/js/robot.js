import {Scene, Sprite} from 'spritejs'
const scene = new Scene('#demo-quickStart', {viewport: [770, 200], resolution: [3080, 800]});
var layer = scene.layer();

const robot = new Sprite('https://p5.ssl.qhimg.com/t01c33383c0e168c3c4.png');

robot.attr({
    anchor: [0, 0.5],
    pos: [0, 0],
});

robot.animate([
    {pos: [0, 0]},
    {pos: [0, 300]},
    {pos: [2700, 300]},
    {pos: [2700, 0]},
], {
    duration: 5000,
    iterations: Infinity,
    direction: 'alternate',
});
layer.append(robot);
