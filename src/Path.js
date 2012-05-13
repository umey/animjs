/**
 * Path
 * manage path data
 */

(function(window){
/**
 * @class Path
 * @constructor
 * @param {Number} x0 start pos X
 * @param {Number} y0 start poy Y
 **/
var Path = function(x0,y0){
        this.pointList = [x0 || 0, y0 || 0];
        this.length = 0;
        this.time = 1000;
        this._timeTable = [];
        this.totalDist = 0;
        this._dirty = false;
        this.color = 0x999999;
        this.loop = true;
};
var p = Path.prototype;
// static properties:
    /**
     * Class name
     * @property name
     * @type {String}
     * @static
     */
    Path.name = "Path";
    /**
     * interval between anchor and next anchor
     * @property BLOCK_COUNT
     * @type {Number}
     * @static
     */
    Path.BLOCK_COUNT = 4;

// private properties:
    /**
     * calculation flag
     * @property _dirty
     * @type {Boolean}
     * @private
     */
    p._dirty = true;

// public properties:
    /**
     * list of anchor point and control point
     * @property pointList
     * @type {Array}
     */
    p.pointList = null;
    /**
     * data length ##
     * @property length
     * @type {Number}
     */
    p.length = 0;
    /**
     * animation total time
     * @property time
     * @type {Number}
     */
    p.time = 0;
    /**
     * list of Time and distance of each anchor
     * @property _timeTable
     * @type {Array}
     * //@private todo change public
     */
    p._timeTable = null;
    /**
     * animation total distance
     * @property totalDist
     * @type {Number}
     */
    p.totalDist = 0;
    /**
     * Color that is used to draw
     * @property color
     * @type {Number}
     */
    p.color = 0;
    /**
     * the flag of loop
     * @property loop
     * @type {Boolean}
     */
    p.loop = true;

// public method:
    /**
     * add new control & anchor point
     * @method push
     * @param {Number} x1 control X
     * @param {Number} y1 control Y
     * @param {Number} x2 anchor X
     * @param {Number} y2 anchor Y
     * @return {Path}
     */
    p.push = function(x1,y1,x2,y2){
        this.pointList.push(x1, y1, x2, y2);
        this.length++;
        var dist = this._getQBAt(this.length-1).getDistance();
        this.totalDist+=dist;
        this._timeTable.push({time:0, dist:dist});
        this._dirty = true;
        return this;
    };
    /**
     * calculate time table
     * @method _calc
     * @private
     */
    p._calc = function(){
        var data = this._timeTable;
        var total = this.totalDist;
        var time = this.time;
        var old = {time:0};
        for(var i=0;i<data.length-1;i++){
            data[i].time = old.time + (time * data[i].dist / total);
            old = data[i];
        }
        data[i].time = time;
        this._dirty = false;
    };
    /**
     * get a point info at the specified time
     * @method getAt
     * @param {Number} time
     * @return {Object}
     */
    p.getAt = function(time){
        if(this.loop === true){
            time=(this.time+time)%(this.time+1);
        }else{
            if(time<0)time=0;
            if(time>this.time)time = this.time;
        }
        if(this._dirty)this._calc();

        var table = this._timeTable;
        var i,old, p,qb;
        var oldTime;
        var head = 0;
        var tail = table.length-1;
        while(head<=tail){
            i = ((head+tail)/2)|0;
            p = table[i];
            oldTime = (i===0)? 0 : table[i-1].time;
            if(time >= oldTime && time<= p.time){
                break;
            }else{
                i = (p.time<time)? head =i+1 : tail = i-1;
            }
        }
        old = table[i-1] || {time:0};

        qb = this._getQBAt(i);
        var t = (time-old.time)/(p.time-old.time);
        var p0 = qb.getAt(t);

        var result ={};
        result.x = p0.x;
        result.y = p0.y;
        result.t = t;
        result.qb = qb;
        result.p0 = p0;
        result.ttIndex = i;

        return result;
    };
    /**
     * draw path to Canvas/Shape
     * @method drawPath
     * @param {HTMLCanvasElement|Shape}canvas
     * @return {HTMLCanvasElement|Shape}
     */
    p.drawPath = function(canvas,color){
        var i,data = this.pointList;
        if(canvas instanceof Shape){
            var g = canvas.graphics;
            g.clear();
            g.moveTo(data[0],data[1]);
            g.s(color || "#" + ("000000" + (this.color|0).toString(16)).substr(-6));
            for(i=2;i<data.length-2;i+=Path.BLOCK_COUNT){
                g.curveTo(data[i],data[i+1],data[i+2],data[i+3]);
            }
            g.f();
        }else{
            var ctx = canvas.getContext("2d");
            ctx.strokeStyle = color || "#" + ("000000" + (this.color|0).toString(16)).substr(-6);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(data[0],data[1] );
            for(i=2;i<data.length;i+=Path.BLOCK_COUNT){
                ctx.quadraticCurveTo(data[i],data[i+1],data[i+2],data[i+3]);
            }
            ctx.stroke();
        }
        return canvas;
    };
    /**
     * add QBezier curve to path
     * @method curveTo
     * @param {Number} x1 control X
     * @param {Number} y1 control Y
     * @param {Number} x2 anchor X
     * @param {Number} y2 anchor Y
     * @return {Path}
     */
    p.curveTo = function(x1,y1,x2,y2){
        return this.push(x1,y1,x2,y2);
    };
    /**
     * shortcut to "curveTo"
     * @method qt
     * @param {Number} x1 control X
     * @param {Number} y1 control Y
     * @param {Number} x2 anchor X
     * @param {Number} y2 anchor Y
     * @return {Path}
     */
    p.qt = function(x1,y1,x2,y2){
        return this.curveTo(x1,y1,x2,y2);
    };
    /**
     * add line(inside, QBezier) to path
     * @method lineTo
     * @param {Number} x2 anchor X
     * @param {Number} y2 anchor Y
     * @return {Path}
     */
    p.lineTo = function(x2,y2){
        var data = this.pointList;
        var x1 = data[data.length-2];
        var y1 = data[data.length-1];
        return this.push((x1+x2)/2,(y1+y2)/2,x2,y2);
    };
    /**
     * shortcut to "lineTo"
     * @method lt
     * @param {Number} x2 anchor X
     * @param {Number} y2 anchor Y
     * @return {Path}
     */
    p.lt = function(x2,y2){
        return this.lineTo(x2,y2);
    };
    /**
     * move first anchor, when call this method, path data is discarded and recreated
     * @method moveTo
     * @param {Number} x0 first anchor X
     * @param {Number} y0 first anchor Y
     * @return {Path}
     */
    p.moveTo = function(x0,y0){
        if(this.length<1){
            Path.constructor.call(this, this.time);
            this.pointList = [x0, y0];
        }else{
            this.lineTo(x0,y0);
        }
        return this;
    };
    /**
     * shortcut to "moveTo"
     * @method mt
     * @param {Number} x0 first anchor X
     * @param {Number} y0 first anchor Y
     * @return {Path}
     */
    p.mt = function(x0,y0){
        return this.moveTo(x0,y0);
    };
    /**
     * set path color(like Graphics.beginStroke)
     * @method beginStroke
     * @param {Number|String} color
     * @return {Path}
     */
    p.beginStroke = function(color){
        if(typeof color == "number"){
            this.color = color;
        }else if(typeof color =="string"){
            // "#FFFFFF" to 0xFFFFFF
            this.color = parseInt("0x" + color.substr(-6));
        }
        return this;
    };
    /**
     * shortcut to "beginStroke"
     * @method p
     * @param {Number|String} color
     * @return {Path}
     */
    p.s = function(color){
        return this.beginStroke(color);
    };
    /**
     * get a QBezier at the specified index
     * @method _getQBAt
     * @param {Number} i index
     * @return {QBezier}
     * //@private todo move public
     */
    p._getQBAt = function(i){
        var data = this.pointList;
        i*=Path.BLOCK_COUNT;
        return new QBezier(new Point(data[i],data[i+1]),new Point(data[i+2],data[i+3]),new Point(data[i+4],data[i+5]));
    };
window.Path = Path;
}(window));