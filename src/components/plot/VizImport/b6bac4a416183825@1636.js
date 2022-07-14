function _1(md){return(
md`# EEZ Globe`
)}

function _rotate(DOM){return(
DOM.range(0, 360, 1)
)}

function _width(){return(
150
)}

function _height(width){return(
width * 1.1
)}

function _sphere(){return(
{type: "Sphere"}
)}

function _name(){return(
""
)}

async function* _canvas2(DOM,width,height,d3,EEZshapes,land,sphere)
{
  
  const context = DOM.context2d(width, height);
  
  var UKcoords = d3.geoCentroid(EEZshapes.features[0])
  
  // const projection = d3.geoOrthographic().fitExtent([[10, 10], [width - 10, height - 10]], sphere);
  var projection = d3.geoOrthographic()
  .rotate([-UKcoords[0], -UKcoords[1]])
  .scale(400)
  .translate([width/2, height/2])
  .clipAngle(15)
  .precision(10);
  
  
  // const projection = d3.geoOrthographic().fitExtent([[10, 10], [width - 10, height - 10]], sphere);
  const path = d3.geoPath(projection, context);
    
  function render(focalEEZ) {
    context.clearRect(0, 0, width, height);
    context.beginPath(), path(land), context.fillStyle = "#ccc", context.fill();
    
    for (const EEZ of EEZshapes.features) {    
     if (EEZ.properties.SOVEREIGN1 === focalEEZ) {
       context.beginPath(), path(EEZ),context.fillStyle = "red",context.fill();
     }
    }
    
    context.beginPath(), path(sphere), context.strokeStyle = "#000", context.lineWidth = 1.5, context.stroke();
    return context.canvas;
  }
  
  let p;
  for (const EEZ of EEZshapes.features) {
    let name = EEZ.properties.SOVEREIGN1;       
    yield render(name);
    
    p = d3.geoCentroid(EEZ);
    const ip = d3.interpolate(projection.rotate(), [-p[0], -p[1]])
    
   await d3.transition()
    .duration(2000)
    .tween("render", () => t => {
      projection.rotate(ip(t));
      render(name);
     })
     .end();
  
  }

  


  
}


function _countryNames(){return(
["Ukraine","Russia", "Others"]
)}

function _9(highlightEEZ){return(
highlightEEZ("Others")
)}

function _10(showMap,mapColor){return(
showMap(mapColor)
)}

function _mapColor(DOM){return(
DOM.input('color')
)}

function _12(muteGlobe2){return(
muteGlobe2()
)}

function _13(muteGlobe){return(
muteGlobe()
)}

function _muteGlobe(d3){return(
function(){

  d3.selectAll("#landBackground")
      .attr("opacity",0.4);

  d3.select("#focal-EEZ-text")
    .text("Hover over an EEZ bar")
    .attr("opacity",1);
  
  d3.select(".map").selectAll(".EEZs")
    .remove();
   

}
)}

function _muteGlobe2(d3){return(
function(){

  d3.selectAll("#landBackground")
      .transition().duration(2000)
      .attr("opacity",0.4);

  d3.select("#focal-EEZ-text")
    .attr("opacity",0)
    .text("Hover over an EEZ bar")
    .transition().duration(2000)
      .attr("opacity",1);
   
  d3.select(".map").selectAll(".EEZs")
    .remove();
   
}
)}

function _showMap(d3,DOM,width,height,path,countries){return(
function(color)   {
   var map = d3.select(DOM.svg(width, height))
    .attr("class", "map")
    .style("background-color","#ebecee")  
  
  let defs = map.append("defs");
  
   defs.append('filter')
     .attr('id','blur')
     .append('feGaussianBlur')
     .attr('stdDeviation',3);
  
  defs.append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path)
    .style("fill", "#F5F5F5")
    .style("stroke","#78909c") ;
  
  map.append("text")
    .attr("dy",-5)
    .append("textPath") //append a textPath to the text element
    .attr("xlink:href", "#sphere") //place the ID of the path here
    .style("text-anchor","middle") //place the text halfway on the arc
    .attr("startOffset", "29%")
    .attr("id", "focal-EEZ-text")
    .text("United Kingdom")
    .style("font-family","National 2 Web")
    .style("font-size",14)
    .style("fill","#78909c");

   map.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");
  
//     map.append("use")
//     .attr("class", "stroke")
//     .attr("xlink:href", "#sphere")
  
    map.append("use")
    .attr("xlink:href", "#sphere")
    .style("filter","url(#blur)")
  
  
     //background land
    for (let i = 0; i < countries.length; i++) {
        map.append("path").attr("id","landBackground")
          .datum(countries[i])
          .attr("fill", "darkgrey")
          .attr("d", path)
          .attr("data-country-id", i)
          .style("fill", color);
          // .style("fill", mapColor);
      

    }
    
    // map.append("use")
    // .attr("id", "sphereOverlay")
    // .attr("class", "fill")
    // .attr("opacity",0)
    // .attr("xlink:href", "#sphere");
  
  return map.node()

   

}
)}

function _highlightEEZ(EEZshapesSorted,d3,path,colorScale,projection){return(
function(focalEEZ, callback){
    let focalShapes = EEZshapesSorted.filter(d => d.properties.ADMIN == focalEEZ)
    let map = d3.select(".map")
    
     d3.selectAll("#landBackground")
      .attr("opacity",1);
    
    d3.select("#focal-EEZ-text")
      .text(focalEEZ)
      .style("fill","#78909c");
    
    let bind =  map.selectAll(".EEZs")
      .data(focalShapes, d => d.index)
      
    bind.enter().append("path")
        .datum(d => d)
        .attr("d", path)
        .attr("class", "EEZs")
        .attr("data-country-id", `${focalEEZ}`)
        .style("fill", d => colorScale(d.index))
     
    bind.exit().remove()
    
    d3.transition()
          .duration(1250)
          .tween("rotate", function(){
          var p = d3.geoCentroid(...focalShapes),
              r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
          return function(t) {
            projection.rotate(r(t));
            map.selectAll("path").attr("d",path)
          }
        }).on("end", callback)
   
   // return map.node()
   
  }
)}

function _projection(d3,EEZshapesSorted,width,height)
{
var UKcoords = d3.geoCentroid(EEZshapesSorted[0])

var projection = d3.geoOrthographic()
  .rotate([-UKcoords[0], -UKcoords[1]])
  .scale(270)
  .translate([width/2, height/2])
  .clipAngle(13)
  .precision(10);
  
  return projection

}


function _path(d3,projection){return(
d3.geoPath()
    .projection(projection)
)}

function _EEZshapesSorted(countryNames,EEZshapes)
{
  let EEZshapesSorted = []
  
  countryNames.map(function(d,i){
    let data = EEZshapes.features.filter(v => v.properties.ADMIN === d);
    data[0].index = i
    EEZshapesSorted.push(...data);
  })
    
  return EEZshapesSorted

}


function _colorScale(d3,countryNames){return(
d3.scaleLinear()
    .domain(d3.extent(d3.range(countryNames.length)))
    .range(["#B53471", "#12CBC4"])
    .interpolate(d3.interpolateHcl)
)}

function _rotation(DOM){return(
DOM.range(0,360,1)
)}

function _EEZshapes(FileAttachment){return(
FileAttachment("exp@2.geojson").json()
)}

function _countries(topojson,world){return(
topojson.feature(world, world.objects.countries).features
)}

function _land(topojson,world){return(
topojson.feature(world, world.objects.land)
)}

function _world(d3){return(
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
)}

function _topojson(require){return(
require("topojson-client@3")
)}

function _d3(require){return(
require("d3@6")
)}

function _29(html){return(
html`
<style>

@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&display=swap');

/*
********************
	National
********************
*/

@font-face {
    font-family: "National 2 Web";
    src: url("https://pudding.cool/assets/fonts/national/National2Web-Regular.woff2") format("woff2");
    font-weight: 500;
    font-style: normal;
    font-stretch: normal;
    font-display: swap;
}

@font-face {
    font-family: "National 2 Web";
    src: url("https://pudding.cool/assets/fonts/national/National2Web-Bold.woff2") format("woff2");
    font-weight: 700;
    font-style: normal;
    font-stretch: normal;
    font-display: swap;
}

</style>
`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["exp@2.geojson", {url: new URL("./files/9f5b0a9b47e2d6a1b494adc3154cd485389c77fa9d62c7afe52da71bd7e1298512a8d0993683e4fcaceb99b6e4787d51375f91ad4f93d1ad32a0c9b0c76b3623.geojson", import.meta.url), mimeType: "application/geo+json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof rotate")).define("viewof rotate", ["DOM"], _rotate);
  main.variable(observer("rotate")).define("rotate", ["Generators", "viewof rotate"], (G, _) => G.input(_));
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("height")).define("height", ["width"], _height);
  main.variable(observer("sphere")).define("sphere", _sphere);
  main.define("initial name", _name);
  main.variable(observer("mutable name")).define("mutable name", ["Mutable", "initial name"], (M, _) => new M(_));
  main.variable(observer("name")).define("name", ["mutable name"], _ => _.generator);
  main.variable(observer("canvas2")).define("canvas2", ["DOM","width","height","d3","EEZshapes","land","sphere"], _canvas2);
  main.variable(observer("countryNames")).define("countryNames", _countryNames);
  main.variable(observer()).define(["highlightEEZ"], _9);
  main.variable(observer()).define(["showMap","mapColor"], _10);
  main.variable(observer("viewof mapColor")).define("viewof mapColor", ["DOM"], _mapColor);
  main.variable(observer("mapColor")).define("mapColor", ["Generators", "viewof mapColor"], (G, _) => G.input(_));
  main.variable(observer()).define(["muteGlobe2"], _12);
  main.variable(observer()).define(["muteGlobe"], _13);
  main.variable(observer("muteGlobe")).define("muteGlobe", ["d3"], _muteGlobe);
  main.variable(observer("muteGlobe2")).define("muteGlobe2", ["d3"], _muteGlobe2);
  main.variable(observer("showMap")).define("showMap", ["d3","DOM","width","height","path","countries"], _showMap);
  main.variable(observer("highlightEEZ")).define("highlightEEZ", ["EEZshapesSorted","d3","path","colorScale","projection"], _highlightEEZ);
  main.variable(observer("projection")).define("projection", ["d3","EEZshapesSorted","width","height"], _projection);
  main.variable(observer("path")).define("path", ["d3","projection"], _path);
  main.variable(observer("EEZshapesSorted")).define("EEZshapesSorted", ["countryNames","EEZshapes"], _EEZshapesSorted);
  main.variable(observer("colorScale")).define("colorScale", ["d3","countryNames"], _colorScale);
  main.variable(observer("viewof rotation")).define("viewof rotation", ["DOM"], _rotation);
  main.variable(observer("rotation")).define("rotation", ["Generators", "viewof rotation"], (G, _) => G.input(_));
  main.variable(observer("EEZshapes")).define("EEZshapes", ["FileAttachment"], _EEZshapes);
  main.variable(observer("countries")).define("countries", ["topojson","world"], _countries);
  main.variable(observer("land")).define("land", ["topojson","world"], _land);
  main.variable(observer("world")).define("world", ["d3"], _world);
  main.variable(observer("topojson")).define("topojson", ["require"], _topojson);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer()).define(["html"], _29);
  return main;
}
