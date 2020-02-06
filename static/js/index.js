
// Etherpad represents updates to the editor's contents
// using these "changeset" objects.
// The docs have some information on changesets.
// https://etherpad.org/doc/v1.8.0-beta.1/#index_changeset_library
var Changeset = require("ep_etherpad-lite/static/js/Changeset");

// We populate this as soon as we detect read-only regions.
var readOnlyRegions = null;

// The immutable HTML elements should have this class.
var READ_ONLY_CLASS = "rox";

// Extracts the contents of the read-only elements
// in the editor's contents.
// Parameters:
// - rep: this is one of the editor's internal data structures.
//   We receive it when the editor calls our entry-point "aceEditEvent"
//   defined below.
// Returns the strings inside the elements marked as read-only.
function getReadOnlyRegions(rep) {
  var readOnlyAttributeName = READ_ONLY_CLASS + ",true";

  // Here we use the AttributePool in the rep object
  // to obtain the read-only attribute's index.
  // We will need the index when we iterate over the alines.
  var attributeIndex = rep.apool.attribToNum[readOnlyAttributeName];
  var opIter;
  var op;
  var value;
  var regions = [];
  var region;
  var currentPosition = 0;

  // Alines are strings that define text line ranges
  // where attributes exist.
  //
  // Here we're going to iterate over the alines in the rep object
  // looking for the ones that refer to our read-only attribute.
  //
  // Once we find one such aline, we get its "chars" field and use it
  // to extract a substring from rep.alltext (which is the entire text
  // in the editor).
  //
  // We collect all these substrings, which are the contents
  // of the read-only regions, and return them.
  rep.alines.forEach(function (aline) {
    opIter = Changeset.opIterator(aline);
    while (opIter.hasNext()){
      op = opIter.next();
      value = Changeset.opAttributeValue(op, READ_ONLY_CLASS, rep.apool);
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

// Simple function that returns true if the two given lists
// have the same elements.
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

// This is the entry-point of the plugin.
exports.aceEditEvent = function (hook, context) {
  var rep = context.rep;

  // Look at the rep object and get the strings
  // inside the read-only regions.
  var currentRegions = getReadOnlyRegions(rep);

  // If we've not seen any read-only regions so far,
  // we will save the ones we just extracted from the rep.
  //
  // Etherpad will call us in the future, once an edit event happens.
  // Then we will see if the read-only regions in this future moment
  // are the same as the ones we first saw.
  if (readOnlyRegions === null || readOnlyRegions.length === 0) {
    readOnlyRegions = currentRegions;
  }

  var equalRegions;
  if (context.callstack.docTextChanged) {
    equalRegions = listsWithSameElements(readOnlyRegions, currentRegions)
    if (!equalRegions) {
      // Tell the editor to revert the last change made.
      context.editorInfo.ace_doUndoRedo("undo");
    }
  }
};
