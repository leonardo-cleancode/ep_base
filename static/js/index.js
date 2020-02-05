
/*
empty pad:

readonly_experiment: rep is {"lines":{},"selStart":[0,0],"selEnd":[0,0],"selFocusAtStart":false,"alltext":"\n","alines":["|1+1"],"apool":{"numToAttrib":{"0":["italic","true"],"1":["italic",""]},"attribToNum":{"italic,true":0,"italic,":1},"nextNum":2}}

wrote the word 'hello':

readonly_experiment: rep is {"lines":{},"selStart":[0,5],"selEnd":[0,5],"selFocusAtStart":false,"alltext":"hello\n","alines":["*2*3*4+5|1+1"],"apool":{"numToAttrib":{"0":["italic","true"],"1":["italic",""],"2":["ace-line","true"],"3":["author","a.c0J0o5uiRaPFjJR4"],"4":["author-a-c0z74z0o5uiz82zaz80zz70zjz74zz82z4","true"]},"attribToNum":{"italic,true":0,"italic,":1,"ace-line,true":2,"author,a.c0J0o5uiRaPFjJR4":3,"author-a-c0z74z0o5uiz82zaz80zz70zjz74zz82z4,true":4},"nextNum":5}}

callstack when I'm typing in the pad:
seems backset is the changeset that puts the pad's representation in the state prior to the change

{"type":"idleWorkTimer","docTextChanged":true,"selectionAffected":true,"userChangedSelection":false,"domClean":true,"isUserChange":true,"repChanged":true,"editEvent":{"eventType":"idleWorkTimer","backset":"Z:4<1-3*0*1+2$he"},"observedSelection":true}

Contents to test the pad with:

curl "localhost:9001/api/1/setHTML?apikey=babysfirstetherpadapikey&padID=test" --data-urlencode "html=<html><body><span class="rox">read-only experiment</span></body></html>"

Rep from editor containing text with the read-only class:
(See the alines attribute associates the read-only attribute
to the first line.)

readonly_experiment: rep is {"lines":{},"selStart":[0,0],"selEnd":[0,0],"selFocusAtStart":false,"alltext":"read-only experiment\nblah\nhello\n\n","alines":["*0+k|1+1","*1*2*3+4*2|1+1","*1*2*3+5*2|1+1","|1+1"],"apool":{"numToAttrib":{"0":["rox","true"],"1":["ace-line","true"],"2":["author","a.c0J0o5uiRaPFjJR4"],"3":["author-a-c0z74z0o5uiz82zaz80zz70zjz74zz82z4","true"]},"attribToNum":{"rox,true":0,"ace-line,true":1,"author,a.c0J0o5uiRaPFjJR4":2,"author-a-c0z74z0o5uiz82zaz80zz70zjz74zz82z4,true":3},"nextNum":4}}

*/

var AttributeManager = require("ep_etherpad-lite/static/js/AttributeManager");
var AttributePool = require("ep_etherpad-lite/static/js/AttributePool");
var Changeset = require("ep_etherpad-lite/static/js/Changeset");

var readOnlyRegions = null;

function getReadOnlyRegions(rep) {
  var attributeIndex = rep.apool.attribToNum["rox,true"];
  var opIter;
  var op;
  var value;
  var regions = [];
  var region;
  var currentPosition = 0;
  //console.log("apool " + JSON.stringify(rep.apool) + " alines " + rep.alines + " attributeIndex " + attributeIndex);
  //console.log("rep " + JSON.stringify(rep));
  rep.alines.forEach(function (aline) {
    opIter = Changeset.opIterator(aline);
    while (opIter.hasNext()){
      op = opIter.next();
      value = Changeset.opAttributeValue(op, "rox", rep.apool);
      if (op.attribs.indexOf(attributeIndex) !== -1) {
        region = rep.alltext.slice(
          currentPosition, currentPosition + op.chars
        );
        regions.push(region);
      }
      currentPosition = currentPosition + op.chars;
    }
  });

  return regions;
}

function listsWithSameElements(list1, list2) {
  if (list1.length === 0 && list2.length === 0) {
    return true;
  }

  var list2HasList1Elems = list1.reduce(function (currentResult, element) {
    var found = list2.indexOf(element) !== -1;
    return currentResult && found;
  }, true);

  var list1HasList2Elems = list2.reduce(function (currentResult, element) {
    var found = list1.indexOf(element) !== -1;
    return currentResult && found;
  }, true);

  return list2HasList1Elems && list1HasList2Elems;
}

exports.aceEditEvent = function (hook, context) {
  //console.log("readonly_experiment: rep is " + JSON.stringify(context.rep));
  //console.log("readonly_experiment: rep keys are " + JSON.stringify(Object.keys(context.rep)));
  //console.log("readonly_experiment: callstack is " + JSON.stringify(context.callstack));

  // I suppose it should be possible to:
  // 1. start watching when an event that represents a change comes in
  //    look at callstack.repChanged
  // 2. look at the change to know if it's inside a read-only region
  // 3. wait for the event with a backset
  // 4. call ace2_inner.doUndoRedo

  // The above doesn't work when the caret is just beside
  // a read-only region.

  // It should be better to find all read-only regions before
  // and after a change and revert the change if the regions after
  // are different from the regions before.

  /*
  var myAttrMan;
  var wasInsideReadOnlyRegion = false;

  if (context.callstack.docTextChanged) {
    console.log("context.callstack.docTextChanged");
    myAttrMan = new AttributeManager(context.rep);
    if (typeof(context.rep.selStart) !== "undefined" && context.rep.selStart !== null) {
      wasInsideReadOnlyRegion = myAttrMan.hasAttributeOnSelectionOrCaretPosition("rox");
      if (wasInsideReadOnlyRegion) {
        console.log("wasInsideReadOnlyRegion - call undo");
        context.editorInfo.ace_doUndoRedo("undo");
      }
    }
  }
  */

  /*
aline *0+k|1+1 op {"opcode":"+","chars":20,"lines":0,"attribs":"*0"} value true
aline *0+k|1+1 op {"opcode":"+","chars":1,"lines":1,"attribs":""} value
aline *1*2*3+4|1+1 op {"opcode":"+","chars":4,"lines":0,"attribs":"*1*2*3"} value
aline *1*2*3+4|1+1 op {"opcode":"+","chars":1,"lines":1,"attribs":""} value

curl "localhost:9001/api/1/setHTML?apikey=babysfirstetherpadapikey&padID=test" --data-urlencode "html=<html><body><span class="rox">Read-Only 1</span> ok to modify here <span class="rox">Read-Only 2 diff len</span></body></html>"

         1         2         3         4         5
123456789012345678901234567890123456789012345678901
Read-Only 1 ok to modify here Read-Only 2 diff len
           ^                  ^                   ^

aline *0+b+j*0+k|1+1 op {"opcode":"+","chars":11,"lines":0,"attribs":"*0"} value true

aline *0+b+j*0+k|1+1 op {"opcode":"+","chars":19,"lines":0,"attribs":""} value

aline *0+b+j*0+k|1+1 op {"opcode":"+","chars":20,"lines":0,"attribs":"*0"} value true

aline *0+b+j*0+k|1+1 op {"opcode":"+","chars":1,"lines":1,"attribs":""} value

  */

  // Second attempt:
  // 1. Get the number for the read-only attribute from the attribute pool
  // 2. get the read-only regions
  // 3. compare with the regions found previously
  //
  // The test I have with a line that contains a read-only region
  // and a writable region (region without the read-only class) fails.
  // The editor did not let me write on the writable region.
  // The read-only attribute association in rep.alines disappears.
  // So this code thinks the read-only region was deleted
  // and calls the undo.
  //
  // Although etherpad clobbers the read-only attribute association,
  // it is possible to have regions with different attributes
  // in the same line.
  // I edited a pad from two browsers and saw alines with
  // two regions with different attributes in a single line.
  var regions = getReadOnlyRegions(context.rep);

  if (readOnlyRegions === null || readOnlyRegions.length === 0) {
    console.log("assign readOnlyRegions: " + JSON.stringify(regions));
    readOnlyRegions = regions;
  }

  // this would have worked if etherpad maintained
  // the read-only attribute associations in alines
  /*
  var equalRegions;
  var emptyCurrentRegions = false;
  if (context.callstack.docTextChanged) {
    console.log("docTextChanged");
    regions = getReadOnlyRegions(context.rep);
    emptyCurrentRegions = regions.length === 0;
    console.log("regions: " + JSON.stringify(regions));
    equalRegions = listsWithSameElements(readOnlyRegions, regions)
    console.log("equalRegions " + equalRegions);
    if (!emptyCurrentRegions && !equalRegions) {
      console.log("undo");
      context.editorInfo.ace_doUndoRedo("undo");
    }
  }
  */

  var equalRegions;
  if (context.callstack.docTextChanged) {
    console.log("docTextChanged");
    regions = getReadOnlyRegions(context.rep);
    console.log("regions: " + JSON.stringify(regions));
    equalRegions = listsWithSameElements(readOnlyRegions, regions)
    console.log("equalRegions " + equalRegions);
    if (!equalRegions) {
      console.log("undo");
      context.editorInfo.ace_doUndoRedo("undo");
    }
  }

/*
curl "localhost:9001/api/1/setHTML?apikey=babysfirstetherpadapikey&padID=test" --data-urlencode "html=<html><body><span class="rox">First Read-Only Line</span><br>ok to modify here<br><span class="rox">Second Read-Only line</span><br>can write anywhere from this point on</body></html>"
*/

};
