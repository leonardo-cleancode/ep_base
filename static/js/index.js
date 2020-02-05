
/*
empty pad:

eadonly_experiment: rep is {"lines":{},"selStart":[0,0],"selEnd":[0,0],"selFocusAtStart":false,"alltext":"\n","alines":["|1+1"],"apool":{"numToAttrib":{"0":["italic","true"],"1":["italic",""]},"attribToNum":{"italic,true":0,"italic,":1},"nextNum":2}}

wrote the word 'hello':

readonly_experiment: rep is {"lines":{},"selStart":[0,5],"selEnd":[0,5],"selFocusAtStart":false,"alltext":"hello\n","alines":["*2*3*4+5|1+1"],"apool":{"numToAttrib":{"0":["italic","true"],"1":["italic",""],"2":["ace-line","true"],"3":["author","a.c0J0o5uiRaPFjJR4"],"4":["author-a-c0z74z0o5uiz82zaz80zz70zjz74zz82z4","true"]},"attribToNum":{"italic,true":0,"italic,":1,"ace-line,true":2,"author,a.c0J0o5uiRaPFjJR4":3,"author-a-c0z74z0o5uiz82zaz80zz70zjz74zz82z4,true":4},"nextNum":5}}

callstack when I'm typing in the pad:
seems backset is the changeset that puts the pad's representation in the state prior to the change

{"type":"idleWorkTimer","docTextChanged":true,"selectionAffected":true,"userChangedSelection":false,"domClean":true,"isUserChange":true,"repChanged":true,"editEvent":{"eventType":"idleWorkTimer","backset":"Z:4<1-3*0*1+2$he"},"observedSelection":true}

Contents to test the pad with:

curl "localhost:9001/api/1/setHTML?apikey=babysfirstetherpadapikey&padID=test" --data-urlencode "html=<html><body><span class="rox">read-only experiment</span></body></html>"

*/

var AttributeManager = require("ep_etherpad-lite/static/js/AttributeManager");

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
};
