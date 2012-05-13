/**
 * Freezer
 * freeze the motion path or the morph shape.
 */

(function(window){
/**
 * @class Freezer
 * @constructor
 **/
var Freezer = function (){
    // Does nothing :)
};
var p = Freezer.prototype;
// static properties:
    /**
     * Class name
     * @property name
     * @type {String}
     * @static
     */
    Freezer.name = "Freezer";

// public method:
    /**
     * freeze the motion path at specified time and intervals
     * @param {MotionPath} motionPath   the target MotionPath
     * @param {Number} time             the total time of animation
     * @param {Number} sampling         the interval of sampling
     * @param {Boolean} rounding        the flag of rounding x,y pos
     * @return {FreezedMotionPath}
     */
    p.freezeMotionPath = function(motionPath,time,sampling,rounding){
        rounding = rounding || null;
        var data = [];
        motionPath.setTime(time);
        for(var i=0;i<time;i+=sampling){
            var o = motionPath.getAt(i);
            if(rounding === true){
                o.x = (o.x+0.5)|0;
                o.y = (o.y+0.5)|0;
            }
            data.push({ x:o.x, y:o.y, rotation:o.rotation || null});
        }
        o = motionPath.getAt(time);
        data.push({
            x:(rounding === true)?(o.x+0.5)|0:o.x,
            y:(rounding === true)?(o.y+0.5)|0:o.y,
            rotation:o.rotation || null
        });
        return new FreezedMotionPath(data,time,sampling);
    };
    /**
     * freeze the MorphShape at specified time and intervals
     * @param {MotionPath} morphShape   the target MorphShape
     * @param {Number} time             the total time of animation
     * @param {Number} sampling         the interval of sampling
     * @return {BitmapAnimation}
     */
    p.freezeMorphShape = function(morphShape,time,sampling){

        var rect0 = morphShape.startRect;
        var rect1 = morphShape.endRect;


        var top = Math.min(rect0.top,rect1.top);
        var left = Math.min(rect0.left,rect1.left);
        var height = Math.max(rect0.height,rect1.height);
        var width = Math.max(rect0.width,rect1.width);

        top|=0;
        left|=0;
        width=(width%1>0)?width:(width+1)|0;
        height=(height%1>0)?height:(height+1|0);

        var interval = (morphShape.time/sampling/time)|0;
        var num = (morphShape.time / interval | 0) - 2;

        if(num<0){
            //invalid value

        }
        var canvasLength = calcLength(width,height,num+2);
        // helper
        function calcLength(width,height,num){
            var longSide = Math.max(width,height);
            var shortSide = Math.min(width,height);
            var i = 1;
            var l = 1;
            var s = 1;
            while (i<num){
                if ((s+1)*shortSide <= (l+1)*longSide){
                    s++;
                }else{
                    l++;
                }
                i = s * l;
            }
            return Math.max(s*shortSide, l*longSide);
        }

        var imgCanvas = window.document.createElement("canvas");
        imgCanvas.width = imgCanvas.height = canvasLength;
        var ctx = imgCanvas.getContext("2d");
        var posX = 0;
        var posY = 0;
        var baseCount = (canvasLength/width)|0;
        var tmpCount = 1;
        morphShape.gotoAndStop(0);
        drawPath(morphShape.data,morphShape.r,morphShape.g,morphShape.b,left,top);
        for(var i=1;i<num;i++){
            posX = (i*width)%canvasLength;
            posY = height * ((tmpCount/baseCount)|0);
            morphShape.gotoAndStop(i*interval);
            drawPath(morphShape.data,morphShape.r,morphShape.g,morphShape.b,left,top);
            tmpCount++;
        }
        posX = (i*width)%canvasLength;
        posY = height * ((tmpCount/baseCount)|0);
        morphShape.gotoAndStop(morphShape.time);
        drawPath(morphShape.data,morphShape.r,morphShape.g,morphShape.b,left,top);

        function drawPath(data,r,g,b,offsetX,offsetY){
            ctx.fillStyle = "#" + ("000000" + ((r<<16|0) | (g<<8|0) | (b|0)).toString(16)).substr(-6);
            ctx.beginPath();
            ctx.moveTo(posX+data[0]-offsetX,posY+data[1]-offsetY);
            for(var j=2;j<data.length;j+=Path.BLOCK_COUNT){
                ctx.quadraticCurveTo(
                    posX+data[j]-offsetX,
                    posY+data[j+1]-offsetY,
                    posX+data[j+2]-offsetX,
                    posY+data[j+3]-offsetY
                );
            }
            ctx.fill();
        }

        return new BitmapAnimation(
            new SpriteSheet({
                images: [imgCanvas.toDataURL()],
                frames: {width:width, height:height, numFrames:num+2}
            })
        );
    };


    window.Freezer = Freezer;
})(window);
