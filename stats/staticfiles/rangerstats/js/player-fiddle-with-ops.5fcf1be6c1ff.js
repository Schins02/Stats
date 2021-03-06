d3.json("/static/rougned.json", function(error, data) {

    //find max for fields, will be single day max

    var WIDTH = 480,
        HEIGHT = 150;

    data.forEach(function(d, i) {
      d.date = d3.time.format("%Y-%m-%d").parse(d.date);
      d.ab = +d.ab;
      d.h = +d.h;
      d.bb = +d.bb;
      d.avg = parseFloat(d.avg);
      d.ops = parseFloat(d.ops);
      d.war = parseFloat(d.war);
      d.index = +d.index;
      d.hbp = +d.hbp;
      d.single = +d.single;
      d.double = +d.double;
      d.triple = +d.triple;
      d.hr = +d.hr;
      d.sf = +d.sf;
    });

    var playerData = crossfilter(data),
        dateDim = playerData.dimension(function(d) {
            return d.date;
        }),
        abDim = playerData.dimension(function(d) {
            return d.ab;
        }),
        hitDim = playerData.dimension(function(d) {
            return d.h;
        });

    var absGroupByDate = dateDim.group().reduceSum(function(d) {
        return d.ab
    });
    var abGroup = abDim.group();
    var dateGroup = dateDim.group();

    var x_domain = d3.extent(data, function(d) {
        return d.date;
    });
    var x_scale = d3.time.scale();
    x_scale.domain(x_domain);


    //Ab chart
    var abChart = dc.barChart("#ab-bar-chart");
    abChart
        .width(WIDTH)
        .height(HEIGHT + 30)
        .x(x_scale)
        .xUnits(function() {
            return 15;
        })
        .y(d3.scale.linear().domain([0, d3.max(data, function(d) {
            return d.ab
        })]))
        .yAxisLabel("At Bats")
        .centerBar(true)
        .colors("#1754A2")
        .dimension(dateDim)
        .alwaysUseRounding(true)
        .group(absGroupByDate);

    abChart.elasticX(true);
    abChart.xAxisPadding(1);
    abChart.xAxis().tickFormat(d3.time.format("%b %d")).ticks(d3.time.days, 3);
    abChart.yAxis().tickFormat(d3.format("d"));
    abChart.render();

    //Hit chart
    var hitChart = dc.barChart("#hit-bar-chart");

    function regularize_groupAll(groupAll) {
        return {
            all: function() {
                return [{
                    key: 'all',
                    value: groupAll.value()
                }];
            }
        };
    }

    var allHits = playerData.groupAll().reduceSum(function(d) {
        return d.h;
    });
    var totalHits = allHits.value();
    console.log("Total hits " + totalHits)
    var regAllHits = regularize_groupAll(allHits);

    hitChart
        .width(200)
        .height(HEIGHT + 30)
        .x(d3.scale.ordinal().domain(["Hits"]))
        .xUnits(dc.units.ordinal)
        .y(d3.scale.linear().domain([0, totalHits]))
        .yAxisLabel("")
        .centerBar(true)
        .colors("#1754A2")
        .dimension(hitDim)
        .brushOn(false)
        .alwaysUseRounding(true)
        .group(regAllHits)

    hitChart.render();

    //Avg chart
    var avgChart = dc.barChart("#avg-chart");

    function avgReduceAdd(p, v) {
        p.count += v.ab;
        p.total += v.h;
        return p;
    }

    function avgReduceRemove(p, v) {
        p.count -= v.ab;
        p.total -= v.h;
        return p;
    }

    function avgReduceInitial() {
        return {
            count: 0,
            total: 0
        };
    }

    var allAvg = abDim.groupAll().reduce(avgReduceAdd, avgReduceRemove, avgReduceInitial);
    var totalAvg = allAvg.value()
    console.log("Total avg total hit count" + totalAvg.total)
    console.log("Total avg count ab count" + totalAvg.count)
    var regTotalAvg = regularize_groupAll(allAvg);

    avgChart
        .width(200)
        .height(HEIGHT + 30)
        .x(d3.scale.ordinal().domain(["Avg"]))
        .xUnits(dc.units.ordinal)
        .y(d3.scale.linear().domain([0, 1]))
        .yAxisLabel("")
        .centerBar(true)
        .colors("#1754A2")
        .dimension(abDim)
        .brushOn(false)
        .alwaysUseRounding(true)
        .group(regTotalAvg)
        .valueAccessor(function(p) {
            return p.value.count > 0 ? p.value.total / p.value.count : 0
        });

    avgChart.render();

    //Ops chart
    var opsChart = dc.barChart("#ops-chart");

    function opsReduceAdd(p, v) {
        p.ab += v.ab;
        p.h += v.h;
        p.bb += v.bb;
        p.single += v.single;
        p.double += v.double;
        p.triple += v.triple;
        p.hr += v.hr;
        p.hbp += v.hbp;
        p.sf += v.sf;
        return p;
    }

    function opsReduceRemove(p, v) {
        p.ab -= v.ab;
        p.h -= v.h;
        p.bb -= v.bb;
        p.single -= v.single;
        p.double -= v.double;
        p.triple -= v.triple;
        p.hr -= v.hr;
        p.hbp -= v.hbp;
        p.sf -= v.sf;
        return p;
    }

    function opsReduceInitial() {
        return {
            ab: 0,
            h: 0,
            bb: 0,
            single: 0,
            double: 0,
            triple: 0,
            hr: 0,
            hbp: 0,
            sf: 0
        };
    }

    var allOps = abDim.groupAll().reduce(opsReduceAdd, opsReduceRemove, opsReduceInitial);
    var regTotalOps = regularize_groupAll(allOps);

    opsChart
        .width(200)
        .height(HEIGHT + 30)
        .x(d3.scale.ordinal().domain(["Ops"]))
        .xUnits(dc.units.ordinal)
        .y(d3.scale.linear().domain([0, 5]))
        .yAxisLabel("")
        .colors("#1754A2")
        .centerBar(true)
        .dimension(abDim)
        .brushOn(false)
        .alwaysUseRounding(true)
        .group(regTotalOps)
        .valueAccessor(function(p) {
            if(p.value.ab > 0){
                var obp = (p.value.h + p.value.bb  + p.value.hbp) / (p.value.ab + p.value.bb + p.value.hbp + p.value.sf);
                var slg =  (p.value.single + (2 * p.value.double) + (3 * p.value.triple) + (4 * p.value.hr)) / p.value.ab;
                return obp + slg
            }
            else
                return 0;
        });

    opsChart.render();

});