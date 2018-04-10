/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 268);
/******/ })
/************************************************************************/
/******/ ({

/***/ 268:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(9)(__webpack_require__(269))

/***/ }),

/***/ 269:
/***/ (function(module, exports) {

module.exports = "/*\n * This is example code that shows how to make a scatterplot widget that backend\n * renders multiple layers.\n */\n\ndocument.addEventListener(\"DOMContentLoaded\", function init() {\n  // A MapdCon instance is used for performing raw queries on a MapD GPU database.\n  new MapdCon()\n    .protocol(\"https\")\n    .host(\"metis.mapd.com\")\n    .port(\"443\")\n    .dbName(\"mapd\")\n    .user(\"mapd\")\n    .password(\"HyperInteractive\")\n    .connect(function(error, con) {\n      // Tables for the first layer of the pointmap.\n      // This layer will be polygons of zipcodes and\n      // will be colored by data joined from the contributions\n      // table\n      var tableName1 = [\"contributions_donotmodify\", \"zipcodes\"];\n      var table1Joins = [{\n        table1: \"contributions_donotmodify\",\n        attr1: \"contributor_zipcode\",\n        table2: \"zipcodes\",\n        attr2: \"ZCTA5CE10\"\n      }];\n      // Table to use for the 2nd layer, which will be points\n      // from a tweets table.\n      var tableName2 = 'tweets_nov_feb';\n\n      // Table to use for the 3nd layer, which will be points\n      // from the contributions table.\n      var tableName3 = 'contributions_donotmodify';\n\n      // make 3 crossfilters for all 3 layers\n      // A CrossFilter instance is used for generating the raw query strings for your MapdCon.\n\n      // first layer\n      var crossFilter = crossfilter.crossfilter(con, tableName1, table1Joins).then(function(cf1) {\n\n        // second layer\n        var crossFilter = crossfilter.crossfilter(con, tableName2).then(function(cf2) {\n\n          // third layer\n          var crossFilter = crossfilter.crossfilter(con, tableName3).then(function(cf3) {\n              createPointMap(cf1, cf2, cf3, con)\n          });\n        });\n      });\n    });\n\n  // function to create the backend-rendered map.\n  function createPointMap(polycfLayer1, pointcfLayer2, pointcfLayer3, con) {\n    var w = document.documentElement.clientWidth - 30;\n    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 150;\n\n    /*---------------------BASIC COUNT ON CROSSFILTER--------------------------*/\n    /*\n     *  Adding a basic count of the point layers using crossfilter.\n     *  Note that for the count we use crossFilter itself as the dimension.\n     */\n    var countGroup1 = pointcfLayer2.groupAll();\n    var dataCount1 = dc.countWidget(\".data-count1\")\n                       .dimension(pointcfLayer2)\n                       .group(countGroup1);\n\n    var countGroup2 = pointcfLayer3.groupAll();\n    var dataCount2 = dc.countWidget(\".data-count2\")\n      .dimension(pointcfLayer3)\n      .group(countGroup2);\n\n\n    /*----------------BUILD THE LAYERS OF THE POINTMAP-------------------------*/\n\n    /*-----BUILD LAYER #1, POLYGONS OF ZIPCODES COLORED BY AVG CONTRIBUTION----*/\n\n    // get the dimensions used for the first layer, the polygon layer\n    // we need the rowid for polygon rendering, so the dimension will be based on\n    // the rowid of the zipcodes\n    var polyDim1 = polycfLayer1.dimension(\"contributor_zipcode\");\n\n    // we're going to color based on the average contribution of the zipcode,\n    // so reduce the average from the join\n    var polyGrp1 = polyDim1.group().reduceAvg(\"contributions_donotmodify.amount\", \"avgContrib\");\n\n    // create the scale to use for the fill color of the polygons.\n    // We're going to use the avg contribution of the zipcode to color the poly.\n    // First, we define a range of colors to use. And then create a quantize scale\n    // to map avg contributions to a color. In this case, quantize equally divides the\n    // domain of the scale into bins to match with the # of colors. We're going to use\n    // a domain of avg contributions of $0-5000. Since we've got 9 colors, the domain\n    // will be split up into 9 equally-sized bins for coloring:\n    // [0, 555], [556, 1100], [1101, 1665], etc.\n    var polyColorRange = [\"#115f9a\",\"#1984c5\",\"#22a7f0\",\"#48b5c4\",\"#76c68f\",\"#a6d75b\",\"#c9e52f\",\"#d0ee11\",\"#d0f400\"]\n    var polyFillColorScale = d3.scale.quantize().domain([0, 5000]).range(polyColorRange)\n\n    // setup the first layer, the zipcode polygons\n    var polyLayer1 = dc.rasterLayer(\"polys\")\n                        .crossfilter(polycfLayer1)\n                        .dimension(polyDim1)\n                        .setState({\n                          data: [\n                            {\n                              table: \"contributions_donotmodify\",\n                              attr: \"contributor_zipcode\"\n                            }, {\n                              table: \"zipcodes\",\n                              attr: \"ZCTA5CE10\"\n                            }\n                          ],\n                          transform: {\n                            limit: 1000000\n                          },\n                          mark: {\n                            type: \"poly\",\n                            strokeColor: \"white\",\n                            strokeWidth: 0,\n                            lineJoin: \"miter\",\n                            miterLimit: 10\n                          },\n                          encoding: {\n                            color: {\n                              type: \"quantitative\",\n                              aggregrate: \"AVG(contributions_donotmodify.amount)\",\n                              domain: [0, 5000],\n                              range: polyColorRange\n                            }\n                          }\n                        })\n                       .popupColumns(['color', 'ZCTA5CE10']) // setup the columns we want to show when\n                                                                  // hit-testing the polygons\n                       .popupColumnsMapped({color: \"avg contribution\", ZCTA5CE10: 'zipcode'})\n                                                                  // setup a map so rename the popup columns\n                                                                  // to something readable.\n\n                       // .popupStyle({                 // can optionally setup a different style for the popup\n                       //     fillColor: \"transparent\"  // geometry. By default, the popup geom is colored the\n                       // })                            // same as the fill/stroke color attributes\n\n\n    /*-----------BUILD LAYER #2, POINTS OF TWEETS-------------*/\n    /*-----SIZED BY # OF FOLLOWERS AND COLORED BY LANGUAGE----*/\n\n    // NOTE: polygon tables are currently rendered by merc-projected vertices, so, to render\n    // a polygon table in a scatterplot means the X&Y dimensions of the scatterplot should be\n    // mercator-projected values. All other layers must also use mercator-projected dimensions.\n\n    // build the dimensions for the 2rd layer, to be rendered as points from a tweets table.\n    // Note that we're converting longitude and latitude to mercator-projected x,y respectively\n    // as the map is a mercator-projected map.\n    // We're also grabbing the language of the tweet as well as the number\n    // of followers the twitter user has to color and size the points\n    var pointMapDim2 = pointcfLayer2.dimension(null).projectOn([\"goog_x\", \"goog_y\", \"lang as color\", \"followers as size\"]);\n\n    // we need separate dimensions for the x and y coordinates for point layers.\n    // A filter is applied to these dimensions under the hood so that we only\n    // render points that are within the view.\n    var xDim2 = pointcfLayer2.dimension(\"goog_x\");\n    var yDim2 = pointcfLayer2.dimension(\"goog_y\");\n\n    // setup a d3 scale for the tweet layer to scale the points based on the number of\n    // followers of the user.\n    // # of followers will be mapped to point sizes that are linearly scaled from 2 to 12 pixels\n    // 0 followers = 2 pixels in size, 5000 followers = 12 pixels, and is linearly interpolated\n    // for values in between, so 2500 followers will get a point size of 7.\n    // We'll clamp this scale, so points will go no smaller than 2 and no larger than 12.\n    var sizeScaleLayer2 = d3.scale.linear().domain([0,5000]).range([2,12]).clamp(true);\n\n    // setup a d3 scale to color the points. In this case we're going to color by\n    // the language of the tweets. As language is a string, or category, and not a numeric domain\n    // we need to use an ordinal scale, which is used to map categories to output values.\n    var langDomain = ['en', 'pt', 'es', 'in', 'und', 'ja', 'tr', 'fr', 'tl', 'ru', 'ar']\n    var langColors = [\"#27aeef\", \"#ea5545\", \"#87bc45\", \"#b33dc6\", \"#f46a9b\", \"#ede15b\", \"#bdcf32\", \"#ef9b20\", \"#4db6ac\", \"#edbf33\", \"#7c4dff\"]\n\n    var layer2ColorScale = d3.scale.ordinal().domain(langDomain).range(langColors);\n\n    // setup the second layer, points of the tweets.\n    var pointLayer2 = dc.rasterLayer(\"points\")\n                        .crossfilter(pointcfLayer2)\n                        .xDim(xDim2)\n                        .yDim(yDim2)\n                        .setState({\n                          transform: {\n                            sample: true,\n                            limit: 500000\n                          },\n                          mark: \"point\",\n                          encoding: {\n                            x: {\n                              type: \"quantitative\",\n                              field: \"goog_x\"\n                            },\n                            y: {\n                              type: \"quantitative\",\n                              field: \"goog_y\"\n                            },\n                            size: {\n                              type: \"quantitative\",\n                              field: \"followers\",\n                              domain: [0, 5000],\n                              range: [2, 12]\n                            },\n                            color: {\n                              type: \"ordinal\",\n                              field: \"lang\",\n                              domain: langDomain,\n                              range: langColors\n                            }\n                          },\n                          config: {\n                            point: {\n                              shape: \"circle\"\n                            }\n                          }\n                        })                                                   // of a tweet is not found in the domain fo the scale\n                        .popupColumns(['tweet_text', 'sender_name', 'tweet_time', 'lang', 'origin', 'followers'])\n                                                  // setup the columns to show when a point is properly hit-tested\n                                                  // against\n\n\n    /*---------------BUILD LAYER #3, POINTS OF CONTRIBUTIONS-------------------*/\n    /*--------COLORED BY THE CONTRIBUTION RECIPIENT'S PARTY AFFILIATON---------*/\n    /*--AND WHOSE SIZE IS DYNAMICALLY CONTROLLED BASED ON NUMBER OF PTS DRAWN--*/\n\n    // NOTE: polygon tables are currently rendered by merc-projected vertices, so, to render\n    // a polygon table in a scatterplot means the X&Y dimensions of the scatterplot should be\n    // mercator-projected values. All other layers must also use mercator-projected dimensions.\n\n    // build the dimensions for the 3nd layer, to be rendered as points from the contributions table\n    // Note that we're converting longitude and latitude to mercator-projected x,y respectively\n    // here as well. We're also going to color by the recepient's\n    // party affiliation, so need to project on that column as well.\n    var pointMapDim3 = pointcfLayer3.dimension(null).projectOn([\"merc_x\", \"merc_y\", \"recipient_party as color\"]);\n\n    // we need separate dimensions for the x and y coordinates for point layers.\n    // A filter is applied to these dimensions under the hood so that we only\n    // render points that are within the view.\n    var xDim3 = pointcfLayer3.dimension(\"merc_x\");\n    var yDim3 = pointcfLayer3.dimension(\"merc_y\");\n\n    // we're going to dynamically scale the size of the points here based on how many\n    // points in this layer are visible in the current view.\n    // If there are 20,000 pts in view, the point size will be 1, if there is 1\n    // point, it's size will be 7 pixels. We'll use a non-linear scale, sqrt in this case,\n    // so that sizes will converge to 7.0 faster as the # of pts goes fro 20K to 1.\n    // We'll also clamp so that sizes go no less than 1 and no greater than 7 pixels.\n    var dynamicSizeScale = d3.scale.sqrt().domain([100000,0]).range([1.0,7.0]).clamp(true)\n\n    // setup a categorical, in other words ordinal, scale for the fill color of the\n    // points based on the contribution recipient's party affiliation. Republicans\n    // will be red and democrats will be blue.\n    var layer3ColorScale = d3.scale.ordinal().domain([\"D\", \"R\"]).range([\"blue\", \"red\"]);\n\n    var pointLayer3 = dc.rasterLayer(\"points\")\n                        .crossfilter(pointcfLayer3)\n                        .setState({\n                          transform: {\n                            sample: true,\n                            limit: 500000\n                          },\n                          mark: \"point\",\n                          encoding: {\n                            x: {\n                              type: \"quantitative\",\n                              field: \"merc_x\"\n                            },\n                            y: {\n                              type: \"quantitative\",\n                              field: \"merc_y\"\n                            },\n                            size: \"auto\",\n                            color: {\n                              type: \"ordinal\",\n                              field: \"recipient_party\",\n                              domain: [\"D\", \"R\"],\n                              range: [\"blue\", \"red\"]\n                            }\n                          },\n                          config: {\n                            point: {\n                              shape: \"circle\"\n                            }\n                          }\n                        })\n                        .xDim(xDim3)\n                        .yDim(yDim3)\n                        .popupColumns(['amount', 'recipient_party', 'recipient_name'])\n                                                  // setup columns to show when a point is properly hit-tested\n\n\n\n\n    /*---------------BUILD THE SCATTERPLOT-------------*/\n    // grab the parent div.\n    var parent = document.getElementById(\"chart1-example\");\n\n    /*\n     * We need the min/max of each dimension of the scatterplot to\n     * initialize a proper view. We calculate these extents first and then\n     * build the scatterplot. We'll use the dimensions from the 2nd layer,\n     * the tweet pts, to drive the scatterplot dimension.\n     * NOTE: All x,y layer dimensions must be in the same space for the\n     * scatterplot to display the layers appropriately. In this case\n     * all layers use mercator-projected pts as the x/y dimensions.\n     * Adding dimensions for the scatterplot chart itself must be\n     * in the same space, otherwise visual wonkiness can occur\n     */\n    var extentMeasures = [\n      {\n        expression: \"goog_x\",\n        agg_mode:\"min\",\n        name: \"xmin\"\n      },\n      {\n        expression: \"goog_x\",\n        agg_mode:\"max\",\n        name: \"xmax\"\n      },\n      {\n        expression: \"goog_y\",\n        agg_mode:\"min\",\n        name: \"ymin\"\n      },\n      {\n        expression: \"goog_y\",\n        agg_mode:\"max\",\n        name: \"ymax\"\n      }\n    ];\n\n    pointcfLayer2.groupAll().reduce(extentMeasures).valuesAsync(true).then(function(extents) {\n      /*\n       * filter the 2nd layer's dimensions. These filters will disseminate to all other layers\n       * upon drawing of the chart, so only need to do it for one layer.\n       */\n      xDim2.filter([extents.xmin, extents.xmax]);\n      yDim2.filter([-8000000,8000000]);\n\n\n      // create the scatterplot. NOTE: all layers must use the same X&Y dimensional space\n      // for there to be obvious correlations in the render. Otherwise things may not appear\n      // where you expect them to\n      var pointMapChart = dc.rasterChart(parent, false) // create a raster chart. false indicates a scatterplot\n                            .con(con)             // indicate the connection layer\n                            .usePixelRatio(true)  // tells the widget to use the pixel ratio of the\n                                                  // screen for proper sizing of the backend-rendered image\n                            .height(h)  // set width/height\n                            .width(w)\n\n                            // add the layers to the pointmap\n                            .pushLayer('polytable1', polyLayer1)\n                            .pushLayer('table1', pointLayer2)\n                            .pushLayer('table2', pointLayer3)\n\n                            // render the grid lines\n                            .renderHorizontalGridLines(true)\n                            .renderVerticalGridLines(true)\n\n                            // set the axis labels\n                            .xAxisLabel('X Axis')\n                            .yAxisLabel('Y Axis')\n\n                            // and setup a buffer radius around the pixels for hit-testing\n                            // This radius helps to properly resolve hit-testing at boundaries\n                            .popupSearchRadius(2)\n                            .enableInteractions(true) // activate interactions (zoom, pan, box-zoom)\n\n      // now render the pointmap\n      dc.renderAllAsync()\n\n\n      /*---------------SETUP HIT-TESTING-------------*/\n      // hover effect with popup\n      // Use a flag to determine if the map is in motion\n      // or not (pan/zoom/etc)\n      var mapmove = false;\n\n      // debounce the popup - we only want to show the popup when the\n      // cursor is idle for a portion of a second.\n      var debouncedPopup = _.debounce(displayPopupWithData, 250)\n      pointMapChart.map().on('movestart', function() {\n        // map has started moving in some way, so cancel\n        // any debouncing, and hide any current popups.\n        mapmove = true;\n        debouncedPopup.cancel();\n        pointMapChart.hidePopup();\n      });\n\n      pointMapChart.map().on('moveend', function(event) {\n        // map has stopped moving, so start a debounce event.\n        // If the cursor is idle, a popup will show if the\n        // cursor is over a layer element.\n        mapmove = false;\n        debouncedPopup(event);\n        pointMapChart.hidePopup();\n      });\n\n      pointMapChart.map().on('mousemove', function(event) {\n        // mouse has started moving, so hide any existing\n        // popups. 'true' in the following call says to\n        // animate the hiding of the popup\n        pointMapChart.hidePopup(true);\n\n        // start a debound popup event if the map isn't\n        // in motion\n        if (!mapmove) {\n          debouncedPopup(event);\n        }\n      })\n\n      // callback function for when the mouse has been idle for a moment.\n      function displayPopupWithData (event) {\n        if (event.point) {\n          // check the pointmap for hit-testing. If a layer's element is found under\n          // the cursor, then display a popup of the resulting columns\n          pointMapChart.getClosestResult(event.point, function(closestPointResult) {\n            // 'true' indicates to animate the popup when starting to display\n            pointMapChart.displayPopup(closestPointResult, true)\n          });\n        }\n      }\n\n\n      /*--------------------------RESIZE EVENT------------------------------*/\n      /* Here we listen to any resizes of the main window.  On resize we resize the corresponding widgets and call dc.renderAll() to refresh everything */\n\n      window.addEventListener(\"resize\", _.debounce(reSizeAll, 500));\n\n      function reSizeAll() {\n        var w = document.documentElement.clientWidth - 30;\n        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 150;\n\n        pointMapChart\n          .width(w)\n          .height(h/1.5);\n\n        dc.redrawAllAsync();\n      }\n    })\n  }\n\n});\n"

/***/ }),

/***/ 9:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function(src) {
	function log(error) {
		(typeof console !== "undefined")
		&& (console.error || console.log)("[Script Loader]", error);
	}

	// Check for IE =< 8
	function isIE() {
		return typeof attachEvent !== "undefined" && typeof addEventListener === "undefined";
	}

	try {
		if (typeof execScript !== "undefined" && isIE()) {
			execScript(src);
		} else if (typeof eval !== "undefined") {
			eval.call(null, src);
		} else {
			log("EvalError: No eval function available");
		}
	} catch (error) {
		log(error);
	}
}


/***/ })

/******/ });
//# sourceMappingURL=multilayerscatterplot.bundle.js.map