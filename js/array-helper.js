//http://www.overset.com/2007/07/11/javascript-recursive-object-copy-deep-object-copy-pass-by-value/
function deepObjCopy(dupeObj) {
    var retObj = new Object();
    if (typeof (dupeObj) == 'object') {
        if (typeof (dupeObj.length) != 'undefined')
            var retObj = new Array();
        for (var objInd in dupeObj) {
            if (typeof (dupeObj[objInd]) == 'object') {
                retObj[objInd] = deepObjCopy(dupeObj[objInd]);
            } else if (typeof (dupeObj[objInd]) == 'string') {
                retObj[objInd] = dupeObj[objInd];
            } else if (typeof (dupeObj[objInd]) == 'number') {
                retObj[objInd] = dupeObj[objInd];
            } else if (typeof (dupeObj[objInd]) == 'boolean') {
                ((dupeObj[objInd] == true) ? retObj[objInd] = true : retObj[objInd] = false);
            }
        }
    }
    return retObj;
}