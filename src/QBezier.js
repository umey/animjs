/**
* QBezier
* Quadratic β spline curve
*/
(function(window) {
/**
 * @class QBezier
 * @constructor
 * @param {Point} p0 start anchor
 * @param {Point} p1 control anchor
 * @param {Point} p2 end anchor
 **/
var QBezier = function QBezier(p0, p1, p2) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
};
var p = QBezier.prototype;
// static properties:
    /**
     * Class name
     * @property name
     * @type {String}
     * @static
     */
    QBezier.name = "QBezier";

// public properties:
    /**
     * start anchor
     * @property p0
     * @type Point
     */
    p.p0 = null;
    /**
     * control anchor
     * @property p1
     * @type Point
     */
    p.p1 = null;
    /**
     * end anchor
     * @property p2
     * @type Point
     */
    p.p2 = null;
// public methods:
    /**
     * calculate the distance between the 3-point
     * Only 3-points. hmm..
     * @method getDistance
     * @return {Number}
     */
    p.getDistance = function () {
        var p = this.getAt(0.5);
        var dist = this._distance(this.p0, p);
        dist += this._distance(this.p2, p);
        return dist;
    };
    /**
     * calculate a point at time
     * @method getAt
     * @param {Number} t time, usually 0<=t<=1
     * @return {Point}
     */
    p.getAt = function (t) {
        if (t <= 0) {
            return this.p0.clone();
        } else if (t >= 1) {
            return this.p2.clone();
        }
        var one_min_t = 1 - t;
        var x = one_min_t * one_min_t * this.p0.x + 2 * one_min_t * t * this.p1.x + t * t * this.p2.x;
        var y = one_min_t * one_min_t * this.p0.y + 2 * one_min_t * t * this.p1.y + t * t * this.p2.y;
        return new Point(x, y);
    };
// private methods:
    /**
     * helper method for calculate the distance between 2 point
     * @private
     * @method _distance
     * @param {Point} p1
     * @param {Point} p2
     * @return {Number}
     */
    p._distance = function (p1, p2) {
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    window.QBezier = QBezier;
}(window));