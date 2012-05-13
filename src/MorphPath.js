/**
 * MorphPath
 * MorphPath must be a "closed-path"
 */

(function(window){
/**
 * @class MorphPath
 * @extends Path
 * @constructor
 **/
var MorphPath = function (){
        MorphPath.__super__.constructor.apply(this, [0,0]);
};
// extends Path
MorphPath.__super__ = Path.prototype;
var p = MorphPath.prototype = new Path();
// static properties:
    /**
     * Class name
     * @property name
     * @type {String}
     * @static
     */
    MorphPath.name = "MorphPath";

// private method
    /**
     * calc interpolate pos
     * @param p0
     * @param p1
     * @param t
     * @return {Point}
     * @private
     */
    p._interpolate = function(p0,p1,t){
        var tx = p1.x-p0.x;
        var ty = p1.y-p0.y;
        var x,y;
        if(tx===0){
            x = p0.x;
            y = p0.y+ty*t;
        }else{
            var a = ty/tx;
            x = p0.x+tx*t;
            y = p0.y+tx*t*a;
        }
        x = ((x*10)|0)/10;
        y = ((y*10)|0)/10;
        return new Point(x, y);
    };

// public method:
    /**
     * calc rectangle
     * @method getRect
     * @return {Object}
     */
    p.getRect = function(){
        var top,left,right,bottom, t,tt;
        var x0,y0,x1,y1,x2,y2,tmp;
        var data = this.pointList;
        top=bottom = data[1];
        right=left = data[0];
        for(var i = 0;i<data.length-2;i+=Path.BLOCK_COUNT){
            x0 = data[i];
            x1 = data[i+2];
            x2 = data[i+4];
            right = Math.max(right,x0,x2);
            left = Math.min(left,x0,x2);
            t = (x0-x1)/(x2-2*x1+x0);
            if(0 <= t && t <= 1){
                tt = 1-t;
                tmp = tt*tt*x0+2*tt*t*x1+t*t*x2;
                if(left>tmp){
                    left = tmp;
                }else if(tmp>right){
                    right = tmp;
                }
            }
        }
        for(i = 0;i<data.length-2;i+=Path.BLOCK_COUNT){
            y0 = data[i+1];
            y1 = data[i+3];
            y2 = data[i+5];
            bottom = Math.max(bottom,y0,y2);
            top = Math.min(top,y0,y2);
            t = (y0-y1)/(y2-2*y1+y0);
            if(0 <= t && t <= 1){
                tt = 1-t;
                tmp = tt*tt*y0+2*tt*t*y1+t*t*y2;
                if(top>tmp){
                    top = tmp;
                }else if(bottom<tmp){
                    bottom = tmp;
                }
            }
        }
        return {top:top, left:left, width:right-left, height:bottom-top};
    };
    /**
     * translate x,y pos to specified point.
     * @param {Number} x
     * @param {Number} y
     */
    p.translate = function(x,y){
        var data = this.pointList;
        for(var i=0;i<data.length;i+=2){
            data[i]-=x;
            data[i+1]-=y;
        }
    };
    /**
     * calc data
     * @method calculate
     */
    p.calculate = function(){
        if(this._dirty = true)this._calc();
    };
    /**
     * split the path at specified time
     * @param time
     */
    p.splitAt = function(time){
        if(time===0 || time == this.time)return;
        var info = this.getAt(time);
        var t = info.t;
        var qb = info.qb;

        var np = qb.getAt(t);
        var cp0 = this._interpolate(qb.p0,qb.p1,t);
        var cp1 = this._interpolate(qb.p1,qb.p2,t);
        var ttIndex = info.ttIndex;

        var dataIndex = 2 + Path.BLOCK_COUNT*ttIndex;
        this.length++;
        this.pointList.splice(dataIndex,2,cp0.x,cp0.y,np.x,np.y,cp1.x,cp1.y);
        var currentObj = this._timeTable[ttIndex];
        var tmpTime = currentObj.dist;
        currentObj.dist*=(1-t);
        this._timeTable.splice(ttIndex,0,{time:time, dist:tmpTime-currentObj.dist});
    };
    /**
     * sort point data by the two specified point
     * search the nearest anchor to the first point, and set the direction by next point.
     * and sort data.
     * @method sortByPoint
     * @param {Number} x0 first point x
     * @param {Number} y0 first point y
     * @param {Number} x1 next point x
     * @param {Number} y1 next point y
     */
    p.sortByPoint = function(x0,y0,x1,y1){
        this.calculate();
        var distance = function(x0,y0,x1,y1){
            var dx = x1-x0;
            var dy = y1-y0;
            return Math.sqrt(dx*dx+dy*dy);
        };
        var data = this.pointList;
        var tTable = this._timeTable;
        var len = data.length;
        data.splice(len-2,2);
        len-=2;

        var lastObj = tTable[tTable.length-1];
        this.totalDist -= lastObj.dist;
        lastObj.dist = new QBezier(new Point(data[0],data[1]),new Point(data[len-2],data[len-1]), new Point(data[len-4],data[len-3])).getDistance();
        this.totalDist += lastObj.dist;

        var headIndex = 0;
        var nearest = distance(x0,y0,data[0],data[1]);
        var v;
        for(var i=4;i<data.length;i+=Path.BLOCK_COUNT){
            v = distance(x0,y0,data[i],data[i+1]);
            if(v<nearest){
                nearest=v;
                headIndex = i;
            }
        }
        var tIndex = headIndex/4;

        var direction = 1;
        var next = distance(x1,y1,data[headIndex+4],data[headIndex+5]);
        var prev = (headIndex-4<0)? distance(x1,y1,data[data.length-6],data[data.length-5]) :distance(x1,y1,data[headIndex-4],data[headIndex-3]);
        if(prev<next)direction = -1;

        data.splice(headIndex,0,data[headIndex],data[headIndex+1]);
        len+=2;
        headIndex+=(direction+1)/2*2;
        var newData = [];
        var tmpIndex = headIndex;
        for(i=0;i<len;i+=2){
            newData.push(data[tmpIndex],data[tmpIndex+1]);
            tmpIndex += len+2*direction;
            tmpIndex%=len;
        }
        this.pointList = newData;
        var newTimeTable = [];
        len = tTable.length;
        tmpIndex = (len+tIndex+(direction-1)/2)%len;
        for(i=0;i<len;i++){
            newTimeTable.push(tTable[tmpIndex]);
            tmpIndex += len+direction;
            tmpIndex%=len;
        }
        this._timeTable = newTimeTable;
        this._calc();
    };
    /**
     * set fill color
     * @method beginFill
     * @param {Number|String} color
     * @return {Path}
     */
    p.beginFill = function(color){
        return this.beginStroke(color);
    };
    /**
     * shortcut to "beginFill"
     * @method f
     * @param {Number|String} color
     * @return {Path}
     */
    p.f = function(color){
        return this.beginStroke(color);
    };
    /**
     * read anchor-contlol-anchor data from the array
     * @method read
     * @param {Array}arr
     */
    p.read = function(arr){
        this.moveTo(arr[0],arr[1]);
        for(var i=2;i<arr.length-2;i+=Path.BLOCK_COUNT){
            this.push(arr[i],arr[i+1],arr[i+2],arr[i+3]);
        }
    };
    window.MorphPath = MorphPath;
})(window);