
// there needs to be a symlink pointing to ep_base:
// ln -s /Users/cleancode/Documents/code/ep_base/ \
// node_modules/ep_chart_test
exports.aceInitInnerdocbodyHead = function (hook, context) {
  var iframeHTML = context["iframeHTML"];

  // chart.js needs to be in node_modules/ep_etherpad-lite/static
  var chartJs = "<script src='/static/chart.js'></script>";

  var makeChart = "<script>function makeChart(metCount, unmetCount, naCount) { var ctx = document.getElementById('myChart'); var myPieChart = new Chart(ctx, { type: 'pie', data: { datasets: [{ data: [metCount, unmetCount, naCount], backgroundColor: ['green', 'red', 'yellow']}] }, options: {} }); console.log('made a chart'); }</script>";

  iframeHTML.push(chartJs);
  iframeHTML.push(makeChart);
};

// setHTML call that creates a chart:

/*
curl "localhost:9001/api/1/setHTML?apikey=babysfirstetherpadapikey&padID=test" --data-urlencode 'html=<html><body><span class="ep_readonly">First Read-Only Line</span><br>ok to modify here<br><span class="ep_readonly">Second Read-Only line</span><br>can write anywhere from this point on<br><span class="elem elem:canvas attr-id:myChart">chart</span><span class="elem elem:script">makeChart(10, 6, 8);</span></body></html>'
*/
