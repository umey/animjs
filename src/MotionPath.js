/*
 * MotionPath
 *
 */
(function(window){
/**
 * @class MotionPath
 * @extends Path
 * @constructor
 * @param {Number} time animation total time
 * @param {Number} rotationStyle [MotionPath.NONE | MotionPath.POI_FLASH | MotionPath.FORWARD]
 **/
var MotionPath = function (time, rotationStyle){
    MotionPath.__super__.constructor.apply(this, [0,0]);
    this.time = time || 1000;
    this.rotationStyle = (rotationStyle===undefined || rotationStyle===null) ? MotionPath.NONE :rotationStyle ;
    this._target = null;
    this._rFuncList = [this._atan, this._atan2];
};
// extends Path
    var p = MotionPath.prototype = new Path();
    MotionPath.__super__ = Path.prototype;
// static properties:
    /**
     * Class name
     * @type {String}
     * @static
     * @const MotionPath.name
     */
    MotionPath.name = "MotionPath";
    /**
     * Constant defining the none rotation.
     * @type {Number}
     * @static
     * @const MotionPath.NONE
     */
    MotionPath.NONE = -1;
    /**
     * Constant defining the Flash-like rotation. Note:"Poi" is a Japanese word meaning "similar" or "like"
     * @type {Number}
     * @static
     * @const MotionPath.POI_FLASH
     */
    MotionPath.POI_FLASH = 0;
    /**
     * Constant defining the rotation in the direction of travel.
     * @type {Number}
     * @static
     * @const MotionPath.FORWARD
     */
    MotionPath.FORWARD = 1;

// static method:
    /**
     * Constant defining the rotation in the direction of travel.
     * @method get
     * @param {Object} target         the target object that will have its x,y(and rotation) properties tweened.
     * @param {Number} time           animation total time
     * @param {Number} rotationStyle  type of rotation
     * @static
     */
    MotionPath.get = function(target, time,rotationStyle){
        var mp = new MotionPath(time, rotationStyle);
        mp.setTarget(target);
        return mp;
    };
// private properties:
    /**
     * the target object that will have its x,y(and rotation) properties tweened.
     * @property _target
     * @type {Object}
     * @private
     */
    p._target = null;
    /**
     * the list of functions for the calculation of the rotation
     * @property _rFuncList
     * @type {Array}
     * @private
     */
    p._rFuncList = null;
// public properties:
    /**
     * type of rotation
     * @property rotationStyle
     * @type {Number}
     */
    p.rotationStyle = 0;

// private method:
    /**
     * get a rotation between two point by atan2
     * @method _atan2
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @return {Number}
     * @private
     */
    p._atan2 = function(x0,y0,x1,y1){
        return Math.atan2(y1-y0,x1-x0)*180/Math.PI;
    };
    /**
     * get a rotation between two point by atan
     * @method _atan
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @return {Number}
     * @private
     */
    p._atan = function(x0,y0,x1,y1){
        var v = (y1-y0)/(x1-x0-0.001);
        return Math.atan(v)*180/Math.PI;
    };
// public method:
    /**
     * get a info at the specified time
     * @method getAt
     * @param {Number} time time
     * @return {Object} info of x,y, and rotation
     */
    p.getAt = function(time){
        var tmpResult = MotionPath.__super__.getAt.call(this,time);
        var t = tmpResult.t;
        var qb = tmpResult.qb;
        var p0 = tmpResult.p0;

        var result;
        if(this._target===null){
            result = {x:tmpResult.x, y:tmpResult.y};
        }else{
            result = this._target;
            result.x = tmpResult.x;
            result.y = tmpResult.y;
        }

        if(this.rotationStyle!==MotionPath.NONE){
            t+=0.001;
            var p1;
            if(t>1){
                //If t is a cheat at an angle to exceed the previous point with a little ;p
                p1 = p0;
                p0 = qb.getAt(1-0.0001);
            }else{
                p1 = qb.getAt(t);
            }
            result.rotation = this._rFuncList[this.rotationStyle].call(this,p0.x,p0.y,p1.x,p1.y);
        }
        return result;
    };

    /**
     * set the target
     * @method setTarget
     * @param {Object} target the target object that will have its x,y(and rotation) properties tweened.
     */
    p.setTarget = function(target){
        this._target = target;
    };
    /**
     * set the total time of animation
     * @method setTime
     * @param {Number} time time
     * @return {MotionPath}
     */
    p.setTime = function(time){
        this.time = time;
        this._dirty = true;
        return this;
    };

    window.MotionPath = MotionPath;
})(window);