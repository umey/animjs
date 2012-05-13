/**
 * MorphShapeBuilder
 *
 */

(function(window){
/**
 * @class MorphShapeBuilder
 * @constructor
 **/
var MorphShapeBuilder =  function(){
        // Does nothing :)
};
var p=MorphShapeBuilder.prototype;
// static properties:
    /**
     * Class name
     * @property name
     * @type {String}
     * @static
     */
    MorphShapeBuilder.name = "MorphShapeBuilder";

// public method:
    /**
     * build the MorphShape from the two MorphMath
     * @param {MorphPath} mp0 start path
     * @param {MorphPath} mp1 end path
     * @param {Number} time total time of animation
     * @param {Function} ease ease function. Usually use Ease class functions
     * @return {MorphShape}
     */
    p.build = function(mp0,mp1,time,ease){
        var ms = new MorphShape();
        mp0.calculate();
        mp1.calculate();

        var sms,lms,st,lt;
        if(mp0.pointList.length>mp1.pointList.length){
            sms = mp1;
            lms = mp0;
        }else{
            sms = mp0;
            lms = mp1;
        }
        st = sms._timeTable;
        lt = lms._timeTable;

        var gap = lt.length - st.length;
        var sTimeIndex, lTimeIndex;
        sTimeIndex = lTimeIndex = 0;

        while(gap>0){
            var sp = st[sTimeIndex];
            var lp = lt[lTimeIndex];
            // timeを比較して、小さいうちは分割
            while(lp.time<sp.time && gap>0){
                sms.splitAt(lp.time);
                lTimeIndex++;
                lp = lt[lTimeIndex];
                gap--;
            }
            sTimeIndex++;
        }

        for(var i=0;i<mp0.pointList.length;i++){
            ms.data.push(mp0.pointList[i]);
            ms.timeline.addTween(Tween.get(ms.data).to(ms.getTweenObj(i,mp1.pointList[i]),time,ease));
        }
        ms.r = mp0.color>>16&0xff;
        ms.g = mp0.color>>8&0xff;
        ms.b = mp0.color&0xff;
        ms.timeline.addTween(Tween.get(ms)).to({r: mp1.color>>16&0xff},time,ease);
        ms.timeline.addTween(Tween.get(ms)).to({g: mp1.color>>8&0xff},time,ease);
        ms.timeline.addTween(Tween.get(ms)).to({b: mp1.color&0xff},time,ease);

        ms.startRect = mp0.getRect();
        ms.endRect = mp1.getRect();

        ms.time = time;

        return ms;
    };
    window.MorphShapeBuilder = MorphShapeBuilder;
})(window);

