import define1 from "./e93997d5089d7165@2303.js";
import define2 from "./b6bac4a416183825@1636.js";

function _1(md){return(
md `# EU Fishing Flow`
)}

function* _Chart1(html,styles,showMap,mapColor,drawChart)
{yield html `

${styles}

<div style = "height: 650px; width: 730px; background-color: #EBECEE; padding: 15px; position: relative; font-family: Lato">

  <div style = "display: flex; height: 100%; border: 2px solid white">

    <div style = "flex: 0.65; background-color: #E4E5E6; padding: 30px 10px 10px 10px; color: #5b5b5b; position: relative"> 

      <text style = "font-size: 1.5rem; font-family: 'National 2 Web'; line-height:1.2"> <span style = "font-weight: bold"> Import Grano ($ mln) in Medio Oriente</span></text>
      <br>

      <hr style = "height: 1px; padding:0; background-color: lightgrey; margin: 20px 20px 20px 5px">
        
      <div id = "waitFor" style = "font-size: 0.9rem; font-family: 'National 2 Web'; opacity:1; align-self: flex-end">
        <i>Posiziona il cursore su una barra di <b>Export Paese</b> per vedere il dettaglio!</i>
      </div>

      <hr style = "height: 1px; padding:0; background-color: lightgrey; margin: 20px 20px 20px 5px">

      <br></br>

      <div id = "descWrapper" style = "font-size: 1.1rem; font-family: 'National 2 Web'; opacity:0">
          <span id = "EEZtonnesPct" style = "text-decoration: underline">
             <span id = "EEZtonnes">1200k tonnes </span> 
             <span id = "EUpct">(49%)</span>
          </span>
          dell'Import di Grano in Medio Oriente proviene da coltivazioni <span class = "Nationality">UK</span>.
          <br><br>
          <span id = "descText2">Di questi, il <span id = "catchPct" style = "text-decoration:underline">34%</span> viene importato in <span class = "egy_nation">UK</span>.
          <br><br>
          <span id = "descText3">Il grano Ucraino e Russo, rappresenta circa il <span id = "totPct" style = "text-decoration:underline"><b>94%</b></span> di tutto l'import Egiziano</span>.
      </div>



   </div>

   <div style = "flex: 0; background-color: #EBECEE; margin-top: 30px" id = "wrapper">
     
      <div style = "position: absolute; left:70%; top: 10%"  id="map" class="mapDiv"> ${showMap(mapColor)} </div>

      <div style = "position: absolute; left:80%; top: 35%; display: grid; grid-template-rows: auto;font-family: caveat; font-size:17px; color: #c2c2c2; line-height:1" >

    </div>

   </div>

  </div>

</div>
`
drawChart();}


function _mapColor(color){return(
color({
  value: "#d9d9d9"
})
)}

function _drawChart(d3,dimensions,impIDs,expIDs,sankeyLabels,x,impCodes,expCodes,EEZstocks,reverseY,EEZtonnage2,reverseYtonn,fleetLandingsPct,simulatedLandings,f,y,$0,generateSim,stackLandings,colorScale,simSpeed,whiteSpace,impNames,highlightEEZ,expNames,interactions){return(
function drawChart() { 
  
  // button
  
  var markProgress = 0;
  let currentSimId = 0;
  
	//////////////////////////// Canvas /////////////////////////////////////
  
  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("viewBox",[0, 0, 330, 330])
    .attr("width", 300)
    .attr("height", 300)
  
  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left}px,
${dimensions.margin.top}px)`)
  
   /////////////////////////////////////////////////////////////////////////
	//////////////////////////// Element groups //////////////////////////////
	/////////////////////////////////////////////////////////////////////////
  
  bounds.append("g").attr("id","sankey")
  bounds.append("g").attr("id","particles")
  bounds.append("g").attr("id","stock-bars")
  bounds.append("g").attr("id","catch-bars")
  bounds.append("g").attr("id","catch-text")
  bounds.append("g").attr("id","EEZ-labels")
  

  /////////////////////////////////////////////////////////////////////////
	//////////////////////////// Scales /////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////
  
  const yScale = d3.scaleLinear()
    .domain([0,1])
    .range([0, dimensions.boundedHeight])
    .clamp(true)
  
  const xScale = d3.scaleLinear()
    .domain([0,impIDs.length-1])
    .range([0, dimensions.boundedWidth])

  
  const linkLineGenerator = d3.line()
    .y((d,i) => i * (dimensions.boundedHeight / 5))
    .x((d,i) => i <= 2
        ? xScale(d[0])
         : xScale(d[1])
      )
    .curve(d3.curveMonotoneX)
  
  const yTransitionProgressScale = d3.scaleLinear()
    .domain([0.35, 0.65])
    .range([0,1])
    .clamp(true)
 
	//////////////////////////// Draw Sankey ////////////////////////////////
	
   const linkOptions = d3.merge(
    //For every EEZ
    expIDs.map(startID => (
       //For every fleet
       impIDs.map(endID => (
         //Return array
        new Array(6).fill([startID, endID])
       ))    
    ))
  )
     
   const links = d3.select("#sankey").selectAll(".category-path")
    .data(linkOptions)
    .enter().append("path")
      .attr("class", "category-path")
      .attr("id", d => `EEZ${d[0][0]}`)
      .attr("d", linkLineGenerator)
      .attr("stroke-width", dimensions.pathWidth)
      .attr("opacity", 1);
  
    //List of paths & ids to reference for particle tracing
    let linksData = [];
    d3.selectAll(".category-path").each(function(d){
      let id = `${d[0][0]} > ${d[0][1]}`
      linksData.push({id: id, path: this});
    })
  
    sankeyLabels(d3.select("#EEZ-labels").append("g").attr("id", "sankey-label-bottom"), dimensions.pathWidth, dimensions.labelHeight, x, dimensions.boundedHeight-20, "sankey-label-bottom", impCodes) 
    sankeyLabels(d3.select("#EEZ-labels").append("g").attr("id", "sankey-label-top"), dimensions.pathWidth, dimensions.labelHeight, x, 0, "sankey-label-top", expCodes)
  
  let pathLength = linksData[0].path.getTotalLength()
  
	//////////////////////////// Draw Particles /////////////////////////////
   
   let sims = []
   
    //Draw static stock-bar background
    d3.select("#stock-bars").selectAll(".static-bar")
      .data(EEZstocks)
      .join("rect")
        .attr("class", "static-bar")
        .attr("id", function(d,i){return expCodes[i]})
        .attr("y", d => -reverseY(d.stock))
        .attr("x", (d,i) => x(i))
        .attr("height", d => reverseY(d.stock))
        .attr("width", dimensions.pathWidth)
        .attr("rx",2)
        .style("fill", "rgba(211, 211, 211,0.6)")
  
     let f2 = d3.format(".4s")
  
     d3.select("#stock-bars")
      .append("g").attr("id", "stock-pct")
      .selectAll("text")
      .data(EEZtonnage2)
       // qui
      .join("text").attr("id", function(d,i){return expCodes[i]})
        .attr("x", (d,i) => x(i) + dimensions.pathWidth/2)
        .attr("y", d => d.EEZ == "Ukraine" ? -reverseYtonn(d.stock) - 24 : -reverseYtonn(d.stock) - 8)
        .text(d => Math.round(d.stock/1000000))
        .style("text-anchor", "middle")
       .style("fill", "#C2C2C2")
      //  .style("font-weight","bold")
        .style("font-size", 13.5)
        .style("font-family", "National 2 Web")
          .append("tspan")
          .attr("dy","1.2em")
          .attr("x",0)
          .text(d =>  `${d.EEZ == "Ukraine" ? "($ mln)" : ""}`)
          .style("font-size", 12)
    
    //Draw catch pct text
    d3.select("#catch-text")
      .selectAll("text")
      .data(fleetLandingsPct(simulatedLandings),(d,i) => i)
      .enter()
      .append("text")
        .text(d => f(d[1]))
        .attr("x", (d,i) => x(i) + dimensions.pathWidth/2)
        .attr("y",  d => y(d[0]) + 18)
        .style("text-anchor", "middle")
        .style("fill", "#C2C2C2")
        .style("font-size", 10)
        .style("font-family", "National 2 Web")
        .style("opacity", 0);
   
  //Update markers
   function updateMarkers(tick, payoutInterval, elapsed, EEZ, maxSims) {   
      
     //If there are still sims to payout, add either 1 or 2 sims to the data store, depdning on how big the EEZ stock is        //(payoutInterval)
      if ($0.value < maxSims) {
      sims = [
        ...sims,
        ...d3.range(payoutInterval < 1 ? 2 : 1).map(() => generateSim(elapsed, EEZ, simulatedLandings, currentSimId))
      ]     
    }   
    
    //Recompute the stacked bar chart segments
    let stackedLandings = stackLandings(simulatedLandings)
    .map(d => (d.forEach(v => v.index = d.index), d))
    
    //Re-bind circles to data
    const particles = d3.select("#particles").selectAll(".marker-circle")
    .data(sims, d => d.id)
    
    //Create circles for new sims
    particles.enter().append("circle")
     .attr("class", "marker marker-circle")
     .attr("r", 2.3)
     .style("opacity", 1)
     .style("fill", d => colorScale(d.EEZ))
    //Remoe spent sims
    particles.exit().remove()
     
    const markers = d3.selectAll(".marker")
    
    //Update circle positions
    markers.each(function(d){
      let path = linksData.filter(l => l.id == d.linkID)[0].path
      d.current = ((elapsed - d.startTime) / simSpeed) * path.getTotalLength() * d.speed
      d.currentPos = path.getPointAtLength(d.current);
    })    
    markers
      .attr("cx", d => d.currentPos.x + d.xJitter)
      .attr("cy", d => d.currentPos.y);
     
    //Remove spent sims from data store
    sims = sims.filter(d => (
       d.currentPos.y < pathLength - dimensions.labelHeight/2
      ));
     
 	//////////////////////////// Draw EEZ Stock Bars ////////////////////////
          
     d3.select("#stock-bars").selectAll(".shrinking-bar")
      .data(EEZstocks)
      .join("rect")         
        .attr("class", "shrinking-bar")
        .attr("y", d => -reverseY(d.stock))
        .attr("x", (d,i) => x(i))
        .attr("height", d => reverseY(d.stock))
        .attr("width", dimensions.pathWidth)
        .attr("rx",2)
        .style("fill", (d,i) => colorScale(i));
     
	//////////////////////////// Draw Catch Bars //////////////////////////     

     d3.select("#catch-bars").selectAll("g")
     .data(stackedLandings)
     .join("g").attr("id", d => `${whiteSpace(d.key)}-segments`)
     .selectAll("rect")
     .data(v => v)
     .join("rect")
      .attr("x", (v,i) => x(impNames.indexOf(v.data.fleet)))
      .attr("y", v => y(v[0]))
      .attr("height", v => y(v[1]) - y(v[0]))
      .attr("width", dimensions.pathWidth)              
      .style("fill",  (d,i) => colorScale((expIDs.length-1) - d.index))
      .attr("rx",3)  
     
     d3.select("#catch-text").selectAll("text")
     .data(fleetLandingsPct(simulatedLandings), (d,i) => i)
     .attr("y",  d => y(d[0]) + 18)
     .text(d => Math.round(d[1]/1000000));
      
    //Update the progress of the ultimate mark, to know when to trigger the next EEZ
    markProgress = d3.min(sims,d => d.currentPos.y);
                
   }
  
	///////////////// Loops ///////////////////////////////////////////////     

  let EEZ = 0
  highlightEEZ(expNames[EEZ])

  function loopEEZs() {  
    //
    let particleAnimations = function(){
      let maxSims = EEZstocks[EEZ].stock
      sims = [];  //Clear sims data-store
      $0.value = 0;  
      let duration = 90;
      let payoutInterval = duration / maxSims;
      let tick = 0;
      markProgress = 0;
      
      //Fade catch pct text in
      if (EEZ == 0) {
          d3.select("#catch-text").selectAll("text")
           .transition().delay(simSpeed*2).duration(2500).style("opacity", 1);
      }

      let ticker = d3.timer(
      function(elapsed){
            
        tick ++  
        updateMarkers(tick, payoutInterval, elapsed, EEZ, maxSims)
        
        let circlesComplete = markProgress >= pathLength - (dimensions.labelHeight/2) - 5;
          
        //if all circles are dealt and there are more more EEZs to go, move onto next EEZ
        if (EEZstocks[EEZ].stock <= 0 && circlesComplete && EEZ < 2) {

          ticker.stop();
          setTimeout(function(){loopEEZs(EEZ++)},100);
          
//           //Highlight focal EEZ labels
//           d3.selectAll(".sankey-label-top").select("text").style("fill","#D3D3D3");
//           d3.selectAll(".sankey-label-top").select("rect").style("stroke","#D3D3D3");
      
//           let focalLabel = d3.select("#sankey-label-top").select(`#${countryCodes[EEZ]}`)
//           focalLabel.select("text").style("fill","grey");
//           focalLabel.select("rect").style("stroke","grey");
        };
        //if all circles are dealt and there are no more EEZs
        if (EEZstocks[EEZ].stock <= 0 && circlesComplete && EEZ == 2) {
           ticker.stop();
           interactions();
        }
        
       })
    
    }
    
    //Colour each EEZ feature on iteration, then run particle animations
    highlightEEZ(expNames[EEZ], particleAnimations) 
    
  }
  
  loopEEZs()

}
)}

function _descText(d3,f,EEZstockPct,EEZtonnage2,expNationalities){return(
function(EEZ){
     d3.select("#EUpct").text(`(${f(EEZstockPct[EEZ])})`);
     d3.select("#EEZtonnes").text(`${Math.round(EEZtonnage2[EEZ].stock/1000000)}$ mln`)
       // .style("color", colorScale(EEZ));
     d3.selectAll(".Nationality").text(expNationalities[EEZ]);
}
)}

function _descText2(d3,f,simulatedLandingsTonnage,expNames,fleetTonnage2){return(
function(EEZ) {
  d3.select('#catchPct').text(
		f(simulatedLandingsTonnage[0][expNames[EEZ]] / fleetTonnage2[EEZ].stock)
	);
  d3.select("#fleetCount").text(
        simulatedLandingsTonnage.filter(d => d.fleet != expNames[EEZ])
       .map(d => d[expNames[EEZ]])
       .filter(v => v > 0)
       .length
     )
  d3.select("#descText2").transition().delay(1000).duration(1500).style("opacity", 1);

  d3.selectAll('.egy_nation').text('Egitto');
}
)}

function _7(EEZstocksStatic){return(
EEZstocksStatic
)}

function _8(expNames){return(
expNames[0]
)}

function _interactions(d3,muteGlobe2,EEZstocksStatic,expCodes,reverseY,xScaleOverlay,colorScale,expNames,descText,descText2,stackLandings,reorderArray,simulatedLandings,x,impNames,y,simulatedLandingsTonnage,yTonn,highlightEEZ,muteGlobe,fleetLandingsPct){return(
function(){
    let stockBars = d3.select("#stock-bars").selectAll("rect");
    let stockBarLengths = d3.selectAll("#stock-bars").selectAll("rect").nodes().map(d => d.getTotalLength());
  
    muteGlobe2()
    
    //Stock-bar overlay
    d3.select("#stock-bars").append("g")
      .attr("id", "static-bar-overlay-group")
      .selectAll(".static-bar-overlay")
      .data(EEZstocksStatic)
      .join("rect")
        .attr("class", ".static-bar-overlay")
        .attr("id", function(d,i){return expCodes[i]})
        .attr("y", d => -reverseY(d.stock) - 30)
        .attr("x", (d,i) => xScaleOverlay(i))
        .attr("height", d => reverseY(d.stock) + 30)
        .attr("width", xScaleOverlay.bandwidth())
        //.style("stroke","black")
        .style("fill","transparent")
    
    //Fade colours back
    stockBars.transition().duration(2000)
     .style("fill", (d,i) => colorScale(i));
    
    let stockBarOverlay = d3.select("#static-bar-overlay-group")
      .selectAll("rect")
  
    stockBarOverlay
      .on("mouseover", function(){
        let selectedEEZ = d3.select(this).data()[0].EEZ
        let EEZindex = expNames.indexOf(selectedEEZ)
        
        // hoverColor(EEZindex);
        d3.select("#descWrapper").style("opacity",1)
        descText(EEZindex);
        descText2(EEZindex);
      
        //Add colour to tooltip figures
        d3.select("#EEZtonnesPct").style("color", colorScale(EEZindex))
        d3.select("#catchPct").style("color", colorScale(EEZindex))
      
        d3.select("#stock-pct").select("#" + this.id + "").style("fill", colorScale(EEZindex))
        
        //Mute non-focal EEZs
        d3.selectAll(".static-bar:not(#" + this.id + ")").style("fill","rgba(211, 211, 211,0.7)");
        d3.selectAll(".sankey-label-top:not(#" + this.id + ")").select("text").style("fill","#D3D3D3");
        d3.selectAll(".sankey-label-top:not(#" + this.id + ")").select("rect").style("stroke","#D3D3D3");

        //Bring selected EEZ to start of segment array
        stackLandings.order(reorderArray(d3.range(expNames.length), EEZindex));
        
        // d3.selectAll(".stock-pct")
       
        let testData = stackLandings(simulatedLandings).map(d => (d.forEach(v => v.key = d.key), d));

        d3.select("#catch-bars").selectAll("g")
        .data(testData)
        .selectAll("rect")
        .data(v => v)
          //qui 2
        .attr("x", (v,i) => x(impNames.indexOf(v.data.fleet)))
        .attr("y", v => y(v[0]))
        .attr("height", v => y(v[1]) - y(v[0]))
        .style("fill", function(d) {
          if (selectedEEZ == d.key){return colorScale(EEZindex)} else {return "rgba(211, 211, 211,0.6)"};
         });
      
       d3.select("#catch-text").selectAll("text")
         .data(simulatedLandingsTonnage.map(d => d[selectedEEZ]),(d,i) => i)
         .attr("y",  d => yTonn(d) + 15)
         .text(d => d > 0 ? Math.round(d/1000000) : null)
         .style("fill", colorScale(EEZindex))
         .style("font-size", 12.5)
         .style("font-weight", 500);
      
        highlightEEZ(expNames[EEZindex]);
         
      })
      .on("mouseleave", function(){
       muteGlobe();
      
      stackLandings.order(d3.stackOrderReverse);
      
      d3.select("#descWrapper").style("opacity",0)
      
       d3.select("#stock-pct").selectAll("text").style("fill", "#C2C2C2")
      
        //Un-mute all EEZs
        d3.selectAll(".static-bar").style("fill", (d,i) => colorScale(i));
        d3.selectAll(".sankey-label-top").select("text").style("fill","grey");
        d3.selectAll(".sankey-label-top:not(#" + this.id + ")").select("rect").style("stroke","grey");
         
        let testData = stackLandings(simulatedLandings).map(d => (d.forEach(v => v.key = d.key), d));
        
        d3.select("#catch-bars").selectAll("g")
        .data(testData)
        .selectAll("rect")
        .data(v => v)
          // qui 3
        .attr("x", (v,i) => x(impNames.indexOf(v.data.fleet)))
        .attr("y", v => y(v[0]))
        .attr("height", v => y(v[1]) - y(v[0]))
        .style("fill",  (d,i) => colorScale(expNames.indexOf(d.key))) 
        
       d3.select("#catch-text").selectAll("text")
         .data(fleetLandingsPct(simulatedLandings), (d,i) => i)
         .attr("y",  d => y(d[0]) + 18)
         .text(d => Math.round(d[1]/1000))
         .style("fill", "#C2C2C2")
         .style("font-size", 13.5)
         .style("font-weight", 400);
      });
  }
)}

function _10(stackLandings,simulatedLandings){return(
stackLandings(simulatedLandings)
)}

function _11(simulatedLandingsTonnage,yTonn){return(
simulatedLandingsTonnage.map(d => d["Ukraine"]).map(d => yTonn(d))
)}

function _currentSimId(){return(
0
)}

function _simulatedLandings(simulatedLandingsData){return(
simulatedLandingsData('fleet')
)}

function _simulatedLandingsTonnage(simulatedLandingsData){return(
simulatedLandingsData('fleet')
)}

function _15(simulatedLandingsTonnage){return(
simulatedLandingsTonnage.map(d => Math.round(d["Russia"]/1000))
)}

function _generateSim($0,expNames,fleetProbabilities,d3,impNames,EEZstocks,simSpeed,simulatedLandingsTonnage,totalTonnage,numParticles,getRandomNumberInRange){return(
function(elapsed, EEZ,  simulatedLandings, currentSimId) { 
    $0.value++
    
    const EEZname = expNames[EEZ]
    const fleetProbDist = fleetProbabilities[EEZname]
    //Simulate a random draw from the probability distribution
    const fleet = d3.bisect(fleetProbDist, Math.random()) 
    //
  const fleetName = impNames[fleet]
  // qui
      
    //Deduct the new sim from the EEZ stocks
    EEZstocks[EEZ]['stock']--
  
    //Add the new sim to the stacked bar chart dataset
    let speed = (Math.random() + 2) / 2.5
    setTimeout(function(){simulatedLandings[fleet][EEZname] ++},simSpeed * (1/speed))   
    setTimeout(function(){simulatedLandingsTonnage[fleet][EEZname] += totalTonnage/numParticles},simSpeed * (1/speed))  
    
    return {
      id: $0.value,
      EEZ: EEZ,
      fleet: fleet,
      linkID: `${EEZ} > ${fleet}`,
      startTime: elapsed + getRandomNumberInRange(-0.1, 0.1),
      xJitter: getRandomNumberInRange(-14, 14),
      speed: speed
    }   
  }
)}

function _simSpeed(){return(
1500
)}

function _whiteSpace(){return(
function(str){
  return str.replace(/\s+/g, '');
}
)}

function _reorderArray(){return(
function(array,value){
  //Add selected value to start of array
  array.unshift(value)
  //Get previous index of this value
  let pos = array.lastIndexOf(value)
  //Delete
  array.splice(pos,1)
  return array;
}
)}

function _20(md){return(
md `## Data`
)}

function _fleetProbabilities(EEZgroups,impNames)
{
  const fleetProbabilities = {}
    //For each EEZ
    EEZgroups.forEach(EEZcountry => {
      const key = EEZcountry.EEZ
      let fleetProbability = 0

      //Add a cumulative percent for each fleet
      fleetProbabilities[key] = impNames.map((fleet,i) => {
        fleetProbability += EEZcountry[fleet]
        if (i == impNames.length - 1) {
          return 1
        } else {
          return fleetProbability
        }
      })

    });
  
  return fleetProbabilities
   
}


function _22(simulatedLandings){return(
simulatedLandings
)}

function _23(fleetLandingsPct,simulatedLandings){return(
fleetLandingsPct(simulatedLandings)
)}

function _fleetLandingsPct(expNames,totalTonnage,numParticles,d3){return(
function(landings) {
  let data = landings.map(function(d){
    let sum = 0
    expNames.map(function(v){
      sum += d[v] || 0
    });
    return sum
  });  
  return data.map(d => [d, d * (totalTonnage/numParticles) ,d/d3.sum(data)  || 0.0001])
}
)}

function _numParticles(){return(
1000
)}

function _data(FileAttachment){return(
FileAttachment("import_origins@4.csv").csv()
)}

function _expNames(){return(
["Ukraine","Russia","Others"]
)}

function _impNames(){return(
["Egypt","Lebanon","Yemen","Tunisia","Sudan","Libya"]
)}

function _countryNames(){return(
["Egypt","Lebanon","Yemen","Tunisia","Sudan","Libya"]
)}

function _countryCodes(){return(
["EGY","LBN","YEM","TUN","SDN","LBY"]
)}

function _expCodes(){return(
["UKR", "RUS", "OTH"]
)}

function _impCodes(){return(
["EGY","LBN","YEM","TUN","SDN","LBY"]
)}

function _impNationalities(){return(
["Egypt","Lebanon","Yemen","Tunisia","Sudan","Libya"]
)}

function _expNationalities(){return(
["Ucraine", "Russe", "di altri paesi"]
)}

function _countryIDs(d3,countryNames){return(
d3.range(countryNames.length)
)}

function _impIDs(d3,impNames){return(
d3.range(impNames.length)
)}

function _expIDs(d3,expNames){return(
d3.range(expNames.length)
)}

function _38(md){return(
md`* Somma totale per paese esportatore (EEZ)`
)}

function _EEZtonnage(data)
{
  //Group by EEZ and sum landings
  var result = [];
  data.reduce(function(res, value) {
    if (!res[value.EEZ]) {
      res[value.EEZ] = {EEZ: value.EEZ, landings: 0};
      result.push(res[value.EEZ])
    }
    res[value.EEZ].landings += +value.landings;
    return res;
  }, {});

  //Condense objects into a single object
  let EEZtonnage = {}  
  result.map(function(d) {
    EEZtonnage[d.EEZ] = d.landings
  })
   
  return EEZtonnage  
             
}


function _EEZtonnage2(expNames,EEZtonnage)
{
  let data = []
  expNames.map(function(d){
   data.push({EEZ: d, stock: Math.round(EEZtonnage[d])})
  })
  return data
}


function _EEZstockPct(EEZtonnage2,totalTonnage){return(
EEZtonnage2.map(d => d.stock / totalTonnage)
)}

function _totalTonnage(d3,EEZtonnage2){return(
d3.sum(EEZtonnage2, d => d.stock)
)}

function _EEZlandings(d3,EEZtonnage)
{
  
  let EEZlandings = {}
  //Convert landings into to Pct
  let total = d3.sum(Object.values(EEZtonnage)) 
  let EEZ = Object.keys(EEZtonnage)
  
  for (EEZ in EEZtonnage) {
    EEZlandings[EEZ] = EEZtonnage[EEZ] / total
  }
 
  return EEZlandings
   
             
}


function _EEZstocks(expNames,EEZlandings,numParticles)
{
  let data = []
  expNames.map(function(d){
   data.push({EEZ: d, stock: Math.round(EEZlandings[d] * numParticles)})
  })
  return data
}


function _EEZstocksStatic(expNames,EEZlandings,numParticles)
{
  let data = []
  expNames.map(function(d){
   data.push({EEZ: d, stock: Math.round(EEZlandings[d] * numParticles)})
  })
  return data
}


function _EEZgroups(data,impNames,d3)
{ 
  
  //Return an object for each unique EEZ
  var EEZgroups = [], 
      flags = [];
  for (var i=0; i < data.length; i++) {
    if (flags[data[i]['EEZ']]) continue; //Skip to next iteration if country has already been added
    flags[data[i]['EEZ']] = true; //Else flag that country has been added
    EEZgroups.push({EEZ: data[i]['EEZ']}); //Push new country to data
  }
  
  //Cycle through importer countries
  EEZgroups.map(function(d){ 
    impNames.map(function(country) {     
      d[country] = 0; //Create a key: value pair for each fleet
      //Swap value for landings
      let EEZ_Data = data.filter(t => t.EEZ == d.EEZ && t.fleet == country)        
       for (var i=0; i < EEZ_Data.length; i++) {
          d[country] = +EEZ_Data[i].landings
       }      
    });
  
  });
  
  
  //Convert landings to % within EEZ
  EEZgroups.map(function(d){
    //Calculate the sum of landings for each EEZ
    let values = Object.values(d)
    values.shift()
    let total = d3.sum(values)

    let fleet = Object.keys(d)

    for (fleet in d) {
      if  (d[fleet] != [d.EEZ])
       d[fleet] = d[fleet] / total
    }
  }); 
    
  return EEZgroups
}


function _simulatedLandingsData(impNames,expNames){return(
function simulatedLandingsData(side) {
  let simulatedLandings = []
  impNames.map(function(d){
    let data = {};
    data[side] = d;
    expNames.map(function(v){
      data[v] = 0
    })
    simulatedLandings.push(data)    
  });
  
  return simulatedLandings
}
)}

function _48(simulatedLandingsData){return(
simulatedLandingsData()
)}

function _49(md){return(
md `## Helper Functions`
)}

function _stackLandings(d3,expNames){return(
d3.stack()
.keys(expNames)
// .order([1,0,2,3,4,5,6,7,8]);
.order(d3.stackOrderReverse)
)}

function _sankeyLabels(){return(
function(parent, labelWidth, labelHeight, xScale, yPos, className, data) {
  let labelGroups = parent.selectAll(className)
        .data(data)
        .enter().append("g")
        .attr("class",className)
        .attr("id", d => `${d}`)
        .attr("transform", (d,i) => `translate(${xScale(i)},${yPos})`)

        labelGroups.append("rect")
        .attr("width",labelWidth).attr("height", labelHeight)
        .style("fill","white")
        .attr("stroke-dasharray","32 20")
        .attr("stroke", "grey")
  
        labelGroups.append("text").text(d => d)
        .attr("x",labelWidth/2)
        .attr("y",15+1)
        .attr("alignment-baseline","middle")
        .style("text-anchor","middle")
        .style("fill","grey")
        .style("font-size","11")
        .style("font-family","National 2 Web");
}
)}

function _52(simulatedLandings){return(
simulatedLandings
)}

function _53(stackLandings,simulatedLandings){return(
stackLandings(simulatedLandings)
)}

function _getRandomNumberInRange(){return(
(min, max) => Math.random() * (max - min) + min
)}

function _getRandomValue(getRandomNumberInRange){return(
arr => arr[Math.floor(getRandomNumberInRange(0, arr.length))]
)}

function _hoverColor(d3,colorScale){return(
function(EEZ){
  d3.select("#EUpct")
     .style("color",colorScale(EEZ))
}
)}

function _57(md){return(
md `## Scales`
)}

function _dimensions()
{
  let dimensions = ({
    width: 500,
    height: 520,
    margin: {
      top:205,
      right: 110,
      bottom: 95,
      left: 90,
    },
    pathWidth: 32,
    labelHeight: 20,
    endBarsWidth: 15,
    endingBarPadding: 3,
  })
  
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom
  
  return dimensions
}


function _59(xScaleOverlay){return(
xScaleOverlay(1)
)}

function _xScaleOverlay(d3,dimensions){return(
d3.scaleBand()
    .domain(d3.range(6))
    .range([-dimensions.pathWidth/2 , dimensions.boundedWidth + dimensions.pathWidth/2])
)}

function _x(d3,impIDs,dimensions){return(
d3.scaleLinear()
   .domain(d3.extent(impIDs))
   .range([-dimensions.pathWidth/2, dimensions.boundedWidth - dimensions.pathWidth/2])
)}

function _y(d3,numParticles,dimensions){return(
d3.scaleLinear()
      .domain([0, numParticles/1.3])
      .rangeRound([dimensions.boundedHeight,dimensions.boundedHeight+200])
)}

function _yTonn(d3,totalTonnage,dimensions){return(
d3.scaleLinear()
      .domain([0, totalTonnage/2])
      .rangeRound([dimensions.boundedHeight,dimensions.boundedHeight+200])
)}

function _colorScale(d3,expIDs){return(
d3.scaleLinear()
    .domain(d3.extent(expIDs))
    .range(["#B53471", "#12CBC4"])
    .interpolate(d3.interpolateHcl)
)}

function _reverseY(d3,numParticles){return(
d3.scaleLinear()
   .domain([0, numParticles/1.3])
   .rangeRound([0,200])
)}

function _reverseYtonn(d3,totalTonnage){return(
d3.scaleLinear()
   .domain([0, totalTonnage/1.3])
   .rangeRound([0,200])
)}

function _f(d3){return(
d3.format(".0%")
)}

function _68(md){return(
md `## Dependancies`
)}

function _d3(require){return(
require("d3@6")
)}

function _styles(html){return(
html`
<style>

 svg { font-family: "National 2 Web"; }

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


@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Caveat:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&display=swap');

#container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2em 2em;
    /*font-family: sans-serif;*/
    font-size: 16px;
    color: #34495e;
    background: #ebecee;
}

#EEZ-labels {
  font-family: sans-serif
}


.wrapper {
    padding-bottom: 5em;
}

svg {
    overflow: visible;
}

svg text {
    user-select: none;
}

.title {
    position: relative;
    margin-top: 1.3em;
    margin-bottom: 0;
    line-height: 1.2em;
    display: flex;
    justify-content: center;
    text-align: center;
    display: flex;
    letter-spacing: -0.011em;
    align-items: center;
}

.description {
    max-width: 40em;
    margin-bottom: 2.9em;
    font-size: 0.9em;
    text-align: center;
    line-height: 1.4em;
    opacity: 0.5;
}

.source {
    position: absolute;
    bottom: 1em;
    left: 2em;
    opacity: 0.5;
    font-size: 0.8em;
    font-style: italic;
}

.source a {
    color: inherit;
}

.category-path {
  fill: none;
  stroke: white;
}

.start-label {
  text-anchor: end;
  dominant-baseline: middle;
}

.start-title {
  text-anchor: end;
  font-size: 0.8em;
  opacity: 0.6;
}

.label {
  font-weight: 600;
  dominant-baseline: middle;
}

.ending-marker {
  opacity: 0.6;
}

.marker {
  mix-blend-mode: multiply;
}

.ending-bar {
  transition: all 0.3s ease-out;
}

.ending-value {
  font-size: 0.7em;
  text-anchor: end;
  font-weight: 600;
  font-feature-settings: 'tnum' 1;
}

.legend {
  font-size: 0.8em;
  opacity: 0.6;
  dominant-baseline: middle:
}

.legend-text-left {
  text-anchor: end;
}

.legend-line {
  stroke: gray;
  stroke-width: 1px;
}

.static-bar.unselected {
  fill: #D3D3D3;
}


</style>
`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["import_origins@4.csv", {url: new URL("./files/98547d76d9915747e6bd856a089e700a43ce16c1daca7b3352a27337ca05924289a51d50ad8ec8c3430614471b55e25f1095647f87d151aa7e9fee41bb75404a.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("Chart1")).define("Chart1", ["html","styles","showMap","mapColor","drawChart"], _Chart1);
  main.variable(observer("viewof mapColor")).define("viewof mapColor", ["color"], _mapColor);
  main.variable(observer("mapColor")).define("mapColor", ["Generators", "viewof mapColor"], (G, _) => G.input(_));
  main.variable(observer("drawChart")).define("drawChart", ["d3","dimensions","impIDs","expIDs","sankeyLabels","x","impCodes","expCodes","EEZstocks","reverseY","EEZtonnage2","reverseYtonn","fleetLandingsPct","simulatedLandings","f","y","mutable currentSimId","generateSim","stackLandings","colorScale","simSpeed","whiteSpace","impNames","highlightEEZ","expNames","interactions"], _drawChart);
  main.variable(observer("descText")).define("descText", ["d3","f","EEZstockPct","EEZtonnage2","expNationalities"], _descText);
  main.variable(observer("descText2")).define("descText2", ["d3","f","simulatedLandingsTonnage","expNames","EEZtonnage2"], _descText2);
  main.variable(observer()).define(["EEZstocksStatic"], _7);
  main.variable(observer()).define(["expNames"], _8);
  main.variable(observer("interactions")).define("interactions", ["d3","muteGlobe2","EEZstocksStatic","expCodes","reverseY","xScaleOverlay","colorScale","expNames","descText","descText2","stackLandings","reorderArray","simulatedLandings","x","impNames","y","simulatedLandingsTonnage","yTonn","highlightEEZ","muteGlobe","fleetLandingsPct"], _interactions);
  main.variable(observer()).define(["stackLandings","simulatedLandings"], _10);
  main.variable(observer()).define(["simulatedLandingsTonnage","yTonn"], _11);
  main.define("initial currentSimId", _currentSimId);
  main.variable(observer("mutable currentSimId")).define("mutable currentSimId", ["Mutable", "initial currentSimId"], (M, _) => new M(_));
  main.variable(observer("currentSimId")).define("currentSimId", ["mutable currentSimId"], _ => _.generator);
  main.variable(observer("simulatedLandings")).define("simulatedLandings", ["simulatedLandingsData"], _simulatedLandings);
  main.variable(observer("simulatedLandingsTonnage")).define("simulatedLandingsTonnage", ["simulatedLandingsData"], _simulatedLandingsTonnage);
  main.variable(observer()).define(["simulatedLandingsTonnage"], _15);
  main.variable(observer("generateSim")).define("generateSim", ["mutable currentSimId","expNames","fleetProbabilities","d3","impNames","EEZstocks","simSpeed","simulatedLandingsTonnage","totalTonnage","numParticles","getRandomNumberInRange"], _generateSim);
  main.variable(observer("simSpeed")).define("simSpeed", _simSpeed);
  main.variable(observer("whiteSpace")).define("whiteSpace", _whiteSpace);
  main.variable(observer("reorderArray")).define("reorderArray", _reorderArray);
  main.variable(observer()).define(["md"], _20);
  main.variable(observer("fleetProbabilities")).define("fleetProbabilities", ["EEZgroups","impNames"], _fleetProbabilities);
  main.variable(observer()).define(["simulatedLandings"], _22);
  main.variable(observer()).define(["fleetLandingsPct","simulatedLandings"], _23);
  main.variable(observer("fleetLandingsPct")).define("fleetLandingsPct", ["expNames","totalTonnage","numParticles","d3"], _fleetLandingsPct);
  main.variable(observer("numParticles")).define("numParticles", _numParticles);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("expNames")).define("expNames", _expNames);
  main.variable(observer("impNames")).define("impNames", _impNames);
  main.variable(observer("countryNames")).define("countryNames", _countryNames);
  main.variable(observer("countryCodes")).define("countryCodes", _countryCodes);
  main.variable(observer("expCodes")).define("expCodes", _expCodes);
  main.variable(observer("impCodes")).define("impCodes", _impCodes);
  main.variable(observer("impNationalities")).define("impNationalities", _impNationalities);
  main.variable(observer("expNationalities")).define("expNationalities", _expNationalities);
  main.variable(observer("countryIDs")).define("countryIDs", ["d3","countryNames"], _countryIDs);
  main.variable(observer("impIDs")).define("impIDs", ["d3","impNames"], _impIDs);
  main.variable(observer("expIDs")).define("expIDs", ["d3","expNames"], _expIDs);
  main.variable(observer()).define(["md"], _38);
  main.variable(observer("EEZtonnage")).define("EEZtonnage", ["data"], _EEZtonnage);
  main.variable(observer("EEZtonnage2")).define("EEZtonnage2", ["expNames","EEZtonnage"], _EEZtonnage2);
  main.variable(observer("EEZstockPct")).define("EEZstockPct", ["EEZtonnage2","totalTonnage"], _EEZstockPct);
  main.variable(observer("totalTonnage")).define("totalTonnage", ["d3","EEZtonnage2"], _totalTonnage);
  main.variable(observer("EEZlandings")).define("EEZlandings", ["d3","EEZtonnage"], _EEZlandings);
  main.variable(observer("EEZstocks")).define("EEZstocks", ["expNames","EEZlandings","numParticles"], _EEZstocks);
  main.variable(observer("EEZstocksStatic")).define("EEZstocksStatic", ["expNames","EEZlandings","numParticles"], _EEZstocksStatic);
  main.variable(observer("EEZgroups")).define("EEZgroups", ["data","impNames","d3"], _EEZgroups);
  main.variable(observer("simulatedLandingsData")).define("simulatedLandingsData", ["impNames","expNames"], _simulatedLandingsData);
  main.variable(observer()).define(["simulatedLandingsData"], _48);
  main.variable(observer()).define(["md"], _49);
  main.variable(observer("stackLandings")).define("stackLandings", ["d3","expNames"], _stackLandings);
  main.variable(observer("sankeyLabels")).define("sankeyLabels", _sankeyLabels);
  main.variable(observer()).define(["simulatedLandings"], _52);
  main.variable(observer()).define(["stackLandings","simulatedLandings"], _53);
  main.variable(observer("getRandomNumberInRange")).define("getRandomNumberInRange", _getRandomNumberInRange);
  main.variable(observer("getRandomValue")).define("getRandomValue", ["getRandomNumberInRange"], _getRandomValue);
  main.variable(observer("hoverColor")).define("hoverColor", ["d3","colorScale"], _hoverColor);
  main.variable(observer()).define(["md"], _57);
  main.variable(observer("dimensions")).define("dimensions", _dimensions);
  main.variable(observer()).define(["xScaleOverlay"], _59);
  main.variable(observer("xScaleOverlay")).define("xScaleOverlay", ["d3","dimensions"], _xScaleOverlay);
  main.variable(observer("x")).define("x", ["d3","impIDs","dimensions"], _x);
  main.variable(observer("y")).define("y", ["d3","numParticles","dimensions"], _y);
  main.variable(observer("yTonn")).define("yTonn", ["d3","totalTonnage","dimensions"], _yTonn);
  main.variable(observer("colorScale")).define("colorScale", ["d3","expIDs"], _colorScale);
  main.variable(observer("reverseY")).define("reverseY", ["d3","numParticles"], _reverseY);
  main.variable(observer("reverseYtonn")).define("reverseYtonn", ["d3","totalTonnage"], _reverseYtonn);
  main.variable(observer("f")).define("f", ["d3"], _f);
  main.variable(observer()).define(["md"], _68);
  const child1 = runtime.module(define1);
  main.import("color", child1);
  const child2 = runtime.module(define2);
  main.import("highlightEEZ", child2);
  main.import("muteGlobe", child2);
  main.import("muteGlobe2", child2);
  main.import("showMap", child2);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("styles")).define("styles", ["html"], _styles);
  return main;
}
