/**
 * MorphShape
 *
 */

(function(window){
/**
 * @class MorphShape
 * @constructor
 **/
var MorphShape =  function(){
    p.initialize.apply(this, arguments);
    this.data = [];
    this.useTicks = true;
    this.loop = true;
    this.timeline = new Timeline(null,null,{useTicks:true,paused:true});
    this.r = 0xff;
    this.g = 0xff;
    this.b = 0xff;
    this.startRect = null;
    this.endRect = null;
    this.time = 0;
};
var p = MorphShape.prototype = new Shape();
// static properties:
    /**
     * Class name
     * @type {String}
     * @static
     * @const  MorphShape.name
     */
    MorphShape.name = "MorphShape";

// properties
    /**
     * point list
     * @property data
     * @type {Array}
     */
    p.data = null;
    /**
     * flag of use tick
     * @property useTicks
     * @type {Boolean}
     */
    p.useTicks = true;
    /**
     * flag of loop
     * @property loop
     * @type {Boolean}
     */
    p.loop = true;
    /**
     * animation timeline
     * @property timeline
     * @type {Timeline}
     */
    p.timeline = null;
    /**
     * red value
     * @property r
     * @type {Number}
     */
    p.r = 0;
    /**
     * green value
     * @property g
     * @type {Number}
     */
    p.g=0;
    /**
     * blue value
     * @property b
     * @type {Number}
     */
    p.b=0;
    /**
     * call back function after onTick
     * sorry,now,MorphShape use the onTick function to draw path,
     * so, if you add a tick-function, use "onCompTick".
     * @property onCompTick
     * @type {Function}
     */
    p.onCompTick = null;
    /**
     * rectangle og the start shape
     * @property startRect
     * @type {Object}
     */
    p.startRect = null;
    /**
     * rectangle og the end shape
     * @property endRect
     * @type {Object}
     */
    p.endRect = null;
    /**
     * total animation time
     * @property time
     * @type {Number}
     */
    p.time = 0;
// public method:
    /**
     * move the frame of animation and stop
     * @method gotoAndStop
     * @param {String|Number} o label name | frame num
     */
    p.gotoAndStop = function(o){
        this.timeline.gotoAndStop(o);
    };
    /**
     * move the frame of animation and play
     * @method gotoAndPlay
     * @param {String | Number} o label name | frame num
     */
    p.gotoAndPlay = function(o){
        this.timeline.gotoAndPlay(o);
    };
    /**
     * helper of create a Object used at tween
     * @param {*}n
     * @param {*}v
     * @return {Object}
     */
    p.getTweenObj = function(n,v){
        var o = {};
        o[n]=v;
        return o;
    };
    /**
     * draw path by onTick
     * onTick
     * @param e
     */
    p.onTick = function(e){
        var g = this.graphics;
        var data = this.data;
        g.clear();
        g.moveTo(data[0],data[1]);
        this.color = (this.r<<16|0) | (this.g<<8|0) | (this.b|0);
        g.f("#" + ("000000" + (this.color).toString(16)).substr(-6));
        for(var i=2;i<data.length-2;i+=4){
            g.curveTo(data[i],data[i+1],data[i+2],data[i+3]);
        }
        g.f();
        if(this.onCompTick!==null){
            this.onCompTick.call(this,e);
        }
    };
    /**
     * release tweens from timeline
     * @method dispose
     * @type {Function}
     */
    p.dispose = function(){
        this.timeline.setPaused = true;
        while(this.timeline._tweens.length>0){
            this.timeline.removeTween(this.timeline._tweens[0]);
        }
    };

    window.MorphShape = MorphShape;
})(window);

