/**
 * Freezer
 * freeze the motion path or the morph shape.
 */
(function(window){
    /**
     * @class Freezer
     * @constructor
     **/
var FreezedMotionPath = function FreezedMotionPath(data,time,sampling){
    this.data = data;
    this.time = time;
    this.sampling = sampling;
    this.loop = true;
};
var p = FreezedMotionPath.prototype;
// static properties:
    /**
     * Class name
     * @property name
     * @type {String}
     * @static
     */
    FreezedMotionPath.name = "FreezedMotionPath";
// properties:
    /**
     * array of the time table
     * @property data
     * @type {Array}
     */
    p.data = null;
    /**
     * the total animation time
     * @property time
     * @type {Number}
     */
    p.time = 0;
    /**
     * the interval of the each time table
     * @property sampling
     * @type {Number}
     */
    p.sampling = 0;
    /**
     * the flag of loop
     * @property loop
     * @type {Boolean}
     */
    p.loop = true;

// public method:
    /**
     * get a info at the specified time
     * @property getAt
     * @param {Number} time
     * @return {Object} the info of x,y and rotation
     */
    p.getAt = function(time){
        if(this.loop===true){
            time = (time+this.time+1)%this.time;
        }
        var i = (time>=this.time) ? this.data.length-1 : (time/this.sampling)|0;
        return this.data[i];
    };
    window.FreezedMotionPath = FreezedMotionPath;
})(window);
