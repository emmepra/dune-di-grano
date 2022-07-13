// https://observablehq.com/@emmepra/wheat-peaks@8218
function _wheat_plot(plotData,wheat){return(
plotData(wheat)
)}

function _detectPeaks(normalize,peakiness,max,d3){return(
function detectPeaks(data, accessor, options) {
  let {lookaround, sensitivity, coalesce, full} = Object.assign({
    lookaround: 2,
    sensitivity: 1.4,
    coalesce: 0,
    full: false
  }, options || accessor)
  
  let values = typeof accessor == "function" ? data.map(accessor) : data

  // Compute a peakiness score for every sample value in `data`
  // We normalize the scale of the scores by mean-centering and dividing by the standard deviation
  // to get a dimensionless quantity such that can be used as a sensitivity parameter
  // across different scales of data (s. t. normalize(x) == normalize(k*x))
  let scores = normalize(
    values.map(
      (value, index) => peakiness(
        values.slice(max(0, index - lookaround), index),
        value,
        values.slice(index + 1, index + lookaround + 1)
      )
    )
  )

  // Candidate peaks are indices whose score is above the sensitivity threshold
  let candidates = d3.range(scores.length).filter(index => scores[index] > sensitivity)

  // If we have multiple peaks, coalesce those that are close together
  let groups = candidates.length ? [[candidates[0]]] : []
  d3.pairs(candidates).forEach(([a, b]) => {
    if (b - a < coalesce) {
      groups[groups.length - 1].push(b)
    } else {
      groups.push([b])
    }
  })

  // Represent every group of peaks by the highest peak in the group
  let peaks = groups.map(
    group => group[d3.scan(group, (a, b) => values[b] - values[a])]
  )

  return full ? { data, values, scores, candidates, groups, peaks } : peaks
}
)}

function _peakiness(d3){return(
function peakiness(left, value, right) {
  // assume zero outside the boundary
  return value - d3.max([d3.min(left) || 0, d3.min(right) || 0]) // this can be max or mean.
}
)}

function _normalize(d3){return(
function normalize(xs) {
  let mean = d3.mean(xs)
  let stdev = d3.deviation(xs)
  return xs.map(x => (x - mean) / stdev)
}
)}

function _line(d3,curve){return(
d3.line().x(10).y(10).curve(curve)
)}

function _curve(d3){return(
function curve() {return d3.curveMonotoneX}
)}

function _chart(xscale,detectPeaks,d3,start,end,peakOffsets,width,pink,arrow,html,short){return(
function chart(data, peakConfig={lookaround:20, sensitivity:4.2, coalesce:15, full: false}, editable=false) {
  // Field accessor functions
  let xf = d => d.date
  let yf = d => d.views
  let x = d => xscale(xf(d))
  let peaks = detectPeaks(data, yf, peakConfig)
  let [min, max] = d3.extent(data, yf)
  if (min === max) {
    max += 0.01 // Prevent degenerate plots (e.g. all zeros) by giving us a vertical height to play with
  }
  
  // Heuristic: We want to offset the title in the event that it may overlap with a peak label.
  // If the peak is more than 75% of the way to being the tallest on screen, and in the x region
  // under the title, offset it. We also always keep editable charts at max height so they don't skip around.
  // In that case, we make the offset a bit smaller so they take up less room, making it look a bit worse when there's an early peak.
  let titleOffset = 80 + (editable || peaks.some(peak => (yf(data[peak]) / max > 0.75) && xscale(xf(data[peak])) < 200) ? (editable ? 40 : 45) : 0)
  
  // Dimension calculation
  let hoverOffset = 20
  let height = 200 + titleOffset + hoverOffset
  let chartHeight = height - hoverOffset
  
  // The y scale depends on dimensions, so compute it here
  let yscale = d3.scaleLinear([0, max], [chartHeight, titleOffset])
  let y = d => yscale(yf(d))
  
  // Area generation for paths
  let curve = d3.curveMonotoneX
  let line = d3.line().x(x).y(y).curve(curve)
  let area = d3.area().x(x).y0(height - hoverOffset).y1(y).curve(curve)
  
  // Labeling and the naming of things
  let labelFormat = {
    // Add years when necessary for disambiguation
    year: start.getYear() == end.getYear() ? undefined : "numeric",
    "month": "long",

  }
  let startLabel = data[0].date.toLocaleString(undefined, labelFormat)
  let endLabel = data[data.length - 1].date.toLocaleString(undefined, labelFormat)
  let articleSlug = unescape(data[0].article), articleName = articleSlug.replace(/_/g, ' ')
  // Appropriately subtitle charts that span multiple years
  let yearRange = start.getYear() == end.getYear() ? start.getFullYear() : (start.getFullYear() + '–' + end.getFullYear())
  
  // Visualizing peaks
  let offsets = peakOffsets(peaks, x, y, data)
  let peakMarkup = peaks.map((p, i) => {
    let xpos = x(data[p]), ypos = y(data[p]),  o = offsets
    // Anchor the text based on proximity to the sides of the visualization
    let anchor = xpos < 50 ? 'start' : xpos > width - 50 ? 'end' : 'middle'
    // Use short or long date formats based on whether you are part of a contiguous run of three offset peaks
    let labelStyle = "long" // (o[i] && o[i-1] && o[i+1] && (o[i-2] || o[i+2])) ? "short" : "long"
    let label = ["Crisi Alimentare", "Guerra in Ucraina"] //peakLabel(data[p], labelStyle)
        return `
      <g class=peak transform="translate(${xpos - 3}, ${ypos - 12})">
        <path class=arrow fill='${pink}' d="${arrow}" />
        <text text-anchor=${anchor} dominant-baseline=baseline y=${-5 + offsets[i]}>${label[i]}</text>
      </g>
    `
  })
 
  let node = html`
    <svg class=time-series width=${width} height=${height} viewBox="0 0 ${width} ${height}">
      <path class=fill d="${area(data)}" />
      <path class=stroke d="${line(data)}" />
      
      <text class=title x=${xscale.range()[0]}>
        <a dominant-baseline=text-before-edge href="" target=_blank>Prezzo del Grano ($USD/Bu)</a>
        <tspan dominant-baseline=text-before-edge x=${xscale(start)} dy=1.65em>Evoluzione prezzo del grano nel periodo ${yearRange}</tspan>
      </text>

      <g class=y-axis>
        <text y=${yscale.range()[0]} dominant-baseline=baseline>${short(yscale.domain()[0])}</text>
        <text y=${yscale.range()[1]} dominant-baseline=text-before-edge>${short(yscale.domain()[1])}</text>
      </g>
      
      <g class=x-axis>
        <text x=${xscale.range()[0]} y=${chartHeight} dominant-baseline=text-before-edge>
          ${startLabel}
        </text>
        <text x=${xscale.range()[1]} y=${chartHeight} dominant-baseline=text-before-edge text-anchor=end >
          ${endLabel}
        </text>
      </g>

      <g class=hover>
        <line x1=0 x2=0 y1=${chartHeight} y2=${chartHeight} />
        <text x=-3 y=${chartHeight} dominant-baseline=text-before-edge />
      </g>
      
      // <g class=peaks>
      //   ${peakMarkup.join('')}
      // </g>

      <rect class=touch-surface x=${xscale.range()[0]} width=${width} height=${chartHeight - titleOffset} y=${titleOffset} fill='transparent' />

  <defs>
        <linearGradient id="MyGradient" gradientTransform="rotate(90)">
          <stop offset="5%" stop-color="#D90C0B" />
          <stop offset="95%" stop-color="#FAFAFA" />
        </linearGradient>
  </defs>
    </svg>  `
  // Augment the SVG with data for use by the hover function
  d3.select(node).datum({data, peaks, y})
  return node 
}
)}

function _hover(d3,xscale,identity,findmin,width,abs,dateToTimestamp,comma){return(
function hover(svg) {
  let left  = svg.select('.x-axis text:first-child')
  let right = svg.select('.x-axis text:last-child')
  
  svg
    .on('mouseenter', update)
    .on('mousemove', update)
    .on('mouseleave', done)
    .on('click', done)
  
  svg.select('.touch-surface')
    .on('touchstart', update)
    .on('touchmove', update)
    .on('click', () => d3.event.stopPropagation())  
  // all x-coordinates available for snapping
  let snapsBySvg = svg.data().map(d => d.peaks.map(p => xscale(d.data[p].date)))
  let snapsUnion = Array.from(new Set(snapsBySvg.flatMap(identity)))
  
  function done() {
    svg.classed('hovering', false)
    left.classed('hidden', false)
    right.classed('hidden', false)
  }
  function update(d, i) {
    // `update` is called in the context of a particular svg element, with that element's data.
    // Therefore `this` here refers to something other than `this` inside the `svg.each`.
    let [hx, hy] = d3.mouse(this)
    
    d3.event.type == "touchmove" && d3.event.preventDefault()
    
    // We resolve peak snapping with respect to the hovered svg.
    // potential x-coordinates to snap this hover position to 
    // snapsBySvg[i]
    let snaps = snapsUnion.filter(x => Math.abs(x - hx) < 10)
    let snapped = snaps.length > 0
    if (snapped) {
      hx = snaps[findmin(snaps, x => Math.abs(x - hx))]
    }
    
    let hdate = xscale.invert(hx)
    // Re-set `hx` to clamp the x position to the projected data range of the x scale.
    // Bug: this will not do the right thing if one time series is shorter than another —
    // the label will contain the correct date but the x position will not snap to it.
    // This is because the clamped xscale ranges across the entire [start, end] date range.
    hx = xscale(hdate)
    let anchor = hx > width - 200 && hx > 150 ? 'end' : 'start'
    
    svg
      .classed('hovering', true)
      .each(function({data, peaks, y}, i) {
        let value = data[findmin(data, d => abs(d.date - hdate))]
        let date = value.date
        let timestamp = dateToTimestamp(date)
        let dateLabel = date.toLocaleString(undefined, {
          month: "long", year: "numeric"
        })
        // Hide axes when the label is near, or, to save intricate special-casing,
        // if the screen is small.
        left.classed('hidden', hx < 60 || width < 400)
        right.classed('hidden', hx > width - 300 || width < 400)

        let hover = d3.select(this).select('.hover')
        hover
          .attr('transform', `translate(${hx}, 0)`)
          .classed('snapped', snapped && snapsBySvg[i].includes(hx))
        hover.select('text')
          .attr('text-anchor', anchor)
          .text(`${comma(value.views)} $/Bu - ${dateLabel}`)
        hover.select('line').attr('y1', y(value))
      })
  }
  
  return svg.nodes()
}
)}

function _plot(csearch,plotData){return(
function plot(query) {return csearch(query).then(plotData)}
)}

function _plotData(chart,html,hover,d3){return(
function plotData(data) {
  let node = chart(data);
  return html`${hover(d3.select(node))}`;
}
)}

function _11(html,reddish,width){return(
html`
<style>
  .clickable { text-decoration: underline; cursor: pointer; font-weight: bold; }
  .clickable:hover { color: ${reddish}; }
  .clickable:active { text-decoration: none; }

  .editable text.title:hover { fill: ${reddish}; } 
  .editable foreignObject { opacity: 1; xtransition: opacity 0.15s ease-out; }
  .editable foreignObject.hidden { opacity: 0; pointer-events: none; }
  .editable foreignObject { height: 30px ;width: ${width}px }
  .editable foreignObject input { color: ${reddish}; border: none; background: rgba(255,255,255,1); font-weight: bold; font-size: 15px;font-family: Valkyrie T4; height: 30px; width: ${width}px; margin: 0; padding: 0; }
  .editable foreignObject input:focus { outline: none; }
</style>
`
)}

function _timeSeriesStyle(html,gray,xscale,end){return(
html`
<style>
  .group .time-series:first-child { padding-top: 0; }
  .group .time-series { padding-top: 1em; }
  .time-series { display: block; overflow: visible; }
  .time-series .title { font-weight: bold; font-size: 1.5rem; }
  .time-series .title tspan { font-weight: normal; font-size: 1.1rem; fill: ${gray}; }
  .time-series path.fill { fill: url(#MyGradient) }
  .time-series path.stroke { fill: transparent; stroke: ; stroke-width: 0.65;}
  .time-series .x-axis { font-size: 1rem; transform: translate(0, 5px); }
  .time-series .y-axis { font-size: 1rem; transform: translate(${xscale(end) + 5}px, 0); fill: ${gray}; }
  .time-series .peaks { font-size: 1rem; font-weight: bold}
  .time-series .hover text { font-size: 1rem; fill: #30425E; transform: translate(0, 5px); }
  .time-series .hover line { stroke: #30425E; stroke-width: 1; }
  .time-series .hover { opacity: 0; transition: opacity 0.15s ease-out; }
  .time-series .hover.snapped { font-weight: bold; }
  .time-series.hovering .hover { opacity: 1; }
  .time-series .x-axis text { opacity: 1; transition: opacity 0.15s ease-out; }
  .time-series .x-axis text.hidden { opacity: 0; }
</style>
`
)}

function _xscale(d3,start,end,width){return(
d3.scaleTime([start, end], [0, width-30]).clamp(true)
)}

function _short(d3){return(
d3.format(".1s")
)}

function _peakOffsets(mod){return(
function peakOffsets(ps, x, y, data) {
  // Simple approximate decollision: vertically offset overlapping peaks,
  // rolling over to zero offset after several consecutive offsets
  let offsets = new Array(ps.length).fill(0)
  let offsetDistance = 50, offsetAmount = 12
  ps.forEach((p, i) => {
    if (i == 0) { return }
    let ydiff = y(data[p]) - y(data[ps[i-1]])
    let xdiff = x(data[p]) - x(data[ps[i-1]])
    if (Math.abs(ydiff) < 10 && xdiff < offsetDistance) {
      offsets[i] = mod((offsets[i-1]||0) - offsetAmount - ydiff, -2*offsetAmount)
    }
  })
  return offsets 
}
)}

function _findmax(identity){return(
function findmax(a, f=identity) {
  if (!a.length) throw new Error("Empty array has no maximum index.")
  return a.reduce((I, x, i, arr) => f(x) > f(arr[I]) ? i : I, 0)
}
)}

function _findmin(identity){return(
function findmin(a, f=identity) {
  if (!a.length) throw new Error("Empty array has no maximum index.")
  return a.reduce((I, x, i, arr) => f(x) < f(arr[I]) ? i : I, 0)
}
)}

function _comma(d3){return(
d3.format(',')
)}

function _peakLabel(){return(
function peakLabel(d) {return ["Crisi Alimentare", "Guerra in Ucraina"]}
)}

function _shortNum(d3){return(
d3.format(".1s")
)}

function _arrow(){return(
`M2.73484 7.26517C2.88128 7.41161 3.11872 7.41161 3.26517 7.26517L5.65165 4.87868C5.7981 4.73223 5.7981 4.4948 5.65165 4.34835C5.5052 4.2019 5.26777 4.2019 5.12132 4.34835L3 6.46967L0.87868 4.34835C0.732233 4.2019 0.494796 4.2019 0.34835 4.34835C0.201903 4.4948 0.201903 4.73223 0.34835 4.87868L2.73484 7.26517ZM2.625 1.63918e-08L2.625 7L3.375 7L3.375 -1.63918e-08L2.625 1.63918e-08Z`
)}

function _start(){return(
new Date(1999, 12, 4)
)}

function _end(){return(
new Date(2022, 5, 31)
)}

function _abs(){return(
function abs(n) {return Math.abs(n)}
)}

function _dateToTimestamp(){return(
function dateToTimestamp(d) {
  let year = d.getUTCFullYear()
  let month = (d.getUTCMonth() + 1).toString().padStart(2, '0')
  let day = d.getUTCDate().toString().padStart(2, '0')
  return `${year}${month}${day}00`
}
)}

function _parseDateString(){return(
function parseDateString(s) {
  let year = +s.substring(0, 4)
  let monthIndex = +s.substring(4, 6) - 1
  let day = +s.substring(6, 8)
  let hour = +s.substring(8, 10)
  return new Date(year, monthIndex, day, hour)  
}
)}

function _dayDiff(){return(
function dayDiff(firstDate, secondDate) { return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(24*60*60*1000 /* hours*minutes*seconds*milliseconds */)))}
)}

function _count(){return(
function count(arr, f) {return arr.reduce((a, b) => a + !!f(b), 0)}
)}

function _identity(){return(
function identity(d) { return d}
)}

function _max(){return(
Math.max
)}

function _fontStyle(html){return(
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

/*
********************
	National Narrow
********************
*/

@font-face {
    font-family: "National 2 Narrow Web";
    src: url("https://pudding.cool/assets/fonts/national/National2NarrowWeb-Extralight.woff2") format("woff2");
    font-weight: 200;
    font-style: normal;
    font-stretch: normal;
    font-display: swap;
}

@font-face {
    font-family: "National 2 Narrow Web";
    src: url("https://pudding.cool/assets/fonts/national/National2NarrowWeb-Regular.woff2") format("woff2");
    font-weight: 500;
    font-style: normal;
    font-stretch: normal;
    font-display: swap;
}

@font-face {
    font-family: "National 2 Narrow Web";
    src: url("https://pudding.cool/assets/fonts/national/National2NarrowWeb-Bold.woff2") format("woff2");
    font-weight: 700;
    font-style: normal;
    font-stretch: normal;
    font-display: swap;
}

@font-face {
    font-family: "National 2 Narrow Web";
    src: url("https://pudding.cool/assets/fonts/national/National2NarrowWeb-Black.woff2") format("woff2");
    font-weight: 900;
    font-style: normal;
    font-stretch: normal;
    font-display: swap;
}

/*
********************
	Tiempos Text
********************
*/

@font-face {
    font-family: "Tiempos Text Web";
    src: url("https://pudding.cool/assets/fonts/tiempos/TiemposTextWeb-Regular.woff2") format("woff2");
    font-weight: 500;
    font-style: normal;
    font-stretch: normal;
    font-display: swap;
}

@font-face {
    font-family: "Tiempos Text Web";
    src: url("https://pudding.cool/assets/fonts/tiempos/TiemposTextWeb-Bold.woff2") format("woff2");
    font-weight: 700;
    font-style: normal;
    font-stretch: normal;
    font-display: swap;
}

/*
********************
	Tiempos Headline
********************
*/

@font-face {
    font-family: "Tiempos Headline Web";
    src: url("https://pudding.cool/assets/fonts/tiempos/TiemposHeadlineWeb-Regular.woff2") format("woff2");
    font-weight: 500;
    font-style: normal;
    font-stretch: normal;
    font-display: swap;
}

</style>
`
)}

function _files(FileAttachment){return(
Object.fromEntries(
  [
    FileAttachment("valkyrie_t4_bold.woff"),
    FileAttachment("concourse_t4_bold.woff"),
    FileAttachment("valkyrie_c3_bold.woff"),
    FileAttachment("valkyrie_c4_bold.woff"),
    FileAttachment("valkyrie_t4_italic.woff"),
    FileAttachment("valkyrie_c4_regular.woff"),
    FileAttachment("valkyrie_c3_regular.woff"),
    FileAttachment("valkyrie_t4_regular.woff"),
    FileAttachment("valkyrie_t4_bold_italic.woff")
  ].map(file => [file.name, file])
)
)}

function _d3(require){return(
require('d3@5')
)}

function _mod(){return(
function mod(a, n) { return ((a%n)+n)%n}
)}

function _reddish(){return(
'#DB0000'
)}

function _pink(){return(
'#FF4387'
)}

function _gray(){return(
'#999'
)}

function _wheat(){return(
[{"date":"2000-01-04T05:00:00.000Z","views":2.4725},{"date":"2000-01-11T05:00:00.000Z","views":2.5375},{"date":"2000-01-19T05:00:00.000Z","views":2.66},{"date":"2000-01-26T05:00:00.000Z","views":2.6},{"date":"2000-02-02T05:00:00.000Z","views":2.5725},{"date":"2000-02-09T05:00:00.000Z","views":2.655},{"date":"2000-02-16T05:00:00.000Z","views":2.6525},{"date":"2000-02-24T05:00:00.000Z","views":2.5725},{"date":"2000-03-02T05:00:00.000Z","views":2.5825},{"date":"2000-03-09T05:00:00.000Z","views":2.6325},{"date":"2000-03-16T05:00:00.000Z","views":2.6625},{"date":"2000-03-23T05:00:00.000Z","views":2.5625},{"date":"2000-03-30T05:00:00.000Z","views":2.555},{"date":"2000-04-06T05:00:00.000Z","views":2.5375},{"date":"2000-04-13T05:00:00.000Z","views":2.5775},{"date":"2000-04-20T05:00:00.000Z","views":2.51},{"date":"2000-04-28T05:00:00.000Z","views":2.5225},{"date":"2000-05-05T05:00:00.000Z","views":2.7275},{"date":"2000-05-12T05:00:00.000Z","views":2.8425},{"date":"2000-05-19T05:00:00.000Z","views":2.7625},{"date":"2000-05-26T05:00:00.000Z","views":2.8075},{"date":"2000-06-05T05:00:00.000Z","views":2.66},{"date":"2000-06-12T05:00:00.000Z","views":2.6575},{"date":"2000-06-19T05:00:00.000Z","views":2.6875},{"date":"2000-06-26T05:00:00.000Z","views":2.74},{"date":"2000-07-03T05:00:00.000Z","views":2.575},{"date":"2000-07-11T05:00:00.000Z","views":2.5625},{"date":"2000-07-18T05:00:00.000Z","views":2.4125},{"date":"2000-07-25T05:00:00.000Z","views":2.455},{"date":"2000-08-01T05:00:00.000Z","views":2.45},{"date":"2000-08-08T05:00:00.000Z","views":2.365},{"date":"2000-08-15T05:00:00.000Z","views":2.405},{"date":"2000-08-22T05:00:00.000Z","views":2.3475},{"date":"2000-08-29T05:00:00.000Z","views":2.5765},{"date":"2000-09-06T05:00:00.000Z","views":2.64},{"date":"2000-09-13T05:00:00.000Z","views":2.57},{"date":"2000-09-20T05:00:00.000Z","views":2.4975},{"date":"2000-09-27T05:00:00.000Z","views":2.585},{"date":"2000-10-04T05:00:00.000Z","views":2.6725},{"date":"2000-10-11T05:00:00.000Z","views":2.7675},{"date":"2000-10-18T05:00:00.000Z","views":2.6375},{"date":"2000-10-25T05:00:00.000Z","views":2.555},{"date":"2000-11-01T05:00:00.000Z","views":2.5475},{"date":"2000-11-08T05:00:00.000Z","views":2.6525},{"date":"2000-11-15T05:00:00.000Z","views":2.545},{"date":"2000-11-22T05:00:00.000Z","views":2.575},{"date":"2000-11-30T05:00:00.000Z","views":2.702},{"date":"2000-12-07T05:00:00.000Z","views":2.705},{"date":"2000-12-14T05:00:00.000Z","views":2.68},{"date":"2000-12-21T05:00:00.000Z","views":2.7275},{"date":"2000-12-29T05:00:00.000Z","views":2.795},{"date":"2001-01-08T05:00:00.000Z","views":2.83},{"date":"2001-01-16T05:00:00.000Z","views":2.8525},{"date":"2001-01-23T05:00:00.000Z","views":2.8575},{"date":"2001-01-30T05:00:00.000Z","views":2.705},{"date":"2001-02-06T05:00:00.000Z","views":2.67},{"date":"2001-02-13T05:00:00.000Z","views":2.63},{"date":"2001-02-21T05:00:00.000Z","views":2.6225},{"date":"2001-02-28T05:00:00.000Z","views":2.744},{"date":"2001-03-07T05:00:00.000Z","views":2.8},{"date":"2001-03-14T05:00:00.000Z","views":2.8375},{"date":"2001-03-21T05:00:00.000Z","views":2.665},{"date":"2001-03-28T05:00:00.000Z","views":2.6425},{"date":"2001-04-04T05:00:00.000Z","views":2.6525},{"date":"2001-04-11T05:00:00.000Z","views":2.6075},{"date":"2001-04-19T05:00:00.000Z","views":2.675},{"date":"2001-04-26T05:00:00.000Z","views":2.7435},{"date":"2001-05-03T05:00:00.000Z","views":2.735},{"date":"2001-05-10T05:00:00.000Z","views":2.685},{"date":"2001-05-17T05:00:00.000Z","views":2.7575},{"date":"2001-05-24T05:00:00.000Z","views":2.6175},{"date":"2001-06-01T05:00:00.000Z","views":2.7075},{"date":"2001-06-08T05:00:00.000Z","views":2.64},{"date":"2001-06-15T05:00:00.000Z","views":2.5575},{"date":"2001-06-22T05:00:00.000Z","views":2.51},{"date":"2001-06-29T05:00:00.000Z","views":2.5575},{"date":"2001-07-09T05:00:00.000Z","views":2.68},{"date":"2001-07-16T05:00:00.000Z","views":2.82},{"date":"2001-07-23T05:00:00.000Z","views":2.835},{"date":"2001-07-30T05:00:00.000Z","views":2.77},{"date":"2001-08-06T05:00:00.000Z","views":2.65},{"date":"2001-08-13T05:00:00.000Z","views":2.715},{"date":"2001-08-20T05:00:00.000Z","views":2.6625},{"date":"2001-08-27T05:00:00.000Z","views":2.735},{"date":"2001-09-04T05:00:00.000Z","views":2.875},{"date":"2001-09-13T05:00:00.000Z","views":2.82},{"date":"2001-09-20T05:00:00.000Z","views":2.6575},{"date":"2001-09-27T05:00:00.000Z","views":2.745},{"date":"2001-10-04T05:00:00.000Z","views":2.7275},{"date":"2001-10-11T05:00:00.000Z","views":2.7925},{"date":"2001-10-18T05:00:00.000Z","views":2.83},{"date":"2001-10-25T05:00:00.000Z","views":2.89},{"date":"2001-11-01T05:00:00.000Z","views":2.8875},{"date":"2001-11-08T05:00:00.000Z","views":2.8375},{"date":"2001-11-15T05:00:00.000Z","views":2.8025},{"date":"2001-11-23T05:00:00.000Z","views":2.89},{"date":"2001-11-30T05:00:00.000Z","views":2.879},{"date":"2001-12-07T05:00:00.000Z","views":2.84},{"date":"2001-12-14T05:00:00.000Z","views":2.8675},{"date":"2001-12-21T05:00:00.000Z","views":2.8875},{"date":"2002-01-02T05:00:00.000Z","views":2.92},{"date":"2002-01-09T05:00:00.000Z","views":3.0275},{"date":"2002-01-16T05:00:00.000Z","views":3.035},{"date":"2002-01-24T05:00:00.000Z","views":2.985},{"date":"2002-01-31T05:00:00.000Z","views":2.86},{"date":"2002-02-07T05:00:00.000Z","views":2.81},{"date":"2002-02-14T05:00:00.000Z","views":2.8075},{"date":"2002-02-22T05:00:00.000Z","views":2.8025},{"date":"2002-03-01T05:00:00.000Z","views":2.785},{"date":"2002-03-08T05:00:00.000Z","views":2.7775},{"date":"2002-03-15T05:00:00.000Z","views":2.8225},{"date":"2002-03-22T05:00:00.000Z","views":2.8175},{"date":"2002-04-01T05:00:00.000Z","views":2.8525},{"date":"2002-04-08T05:00:00.000Z","views":2.73},{"date":"2002-04-15T05:00:00.000Z","views":2.7175},{"date":"2002-04-22T05:00:00.000Z","views":2.6475},{"date":"2002-04-29T05:00:00.000Z","views":2.614},{"date":"2002-05-06T05:00:00.000Z","views":2.715},{"date":"2002-05-13T05:00:00.000Z","views":2.7875},{"date":"2002-05-20T05:00:00.000Z","views":2.7675},{"date":"2002-05-28T05:00:00.000Z","views":2.72},{"date":"2002-06-04T05:00:00.000Z","views":2.82},{"date":"2002-06-11T05:00:00.000Z","views":2.795},{"date":"2002-06-18T05:00:00.000Z","views":2.8925},{"date":"2002-06-25T05:00:00.000Z","views":2.9275},{"date":"2002-07-02T05:00:00.000Z","views":3.205},{"date":"2002-07-10T05:00:00.000Z","views":3.2475},{"date":"2002-07-17T05:00:00.000Z","views":3.35},{"date":"2002-07-24T05:00:00.000Z","views":3.36},{"date":"2002-07-31T05:00:00.000Z","views":3.34},{"date":"2002-08-07T05:00:00.000Z","views":3.4625},{"date":"2002-08-14T05:00:00.000Z","views":3.57},{"date":"2002-08-21T05:00:00.000Z","views":3.3825},{"date":"2002-08-28T05:00:00.000Z","views":3.5955},{"date":"2002-09-05T05:00:00.000Z","views":3.93},{"date":"2002-09-12T05:00:00.000Z","views":4.06},{"date":"2002-09-19T05:00:00.000Z","views":3.955},{"date":"2002-09-26T05:00:00.000Z","views":4.0225},{"date":"2002-10-03T05:00:00.000Z","views":3.7475},{"date":"2002-10-10T05:00:00.000Z","views":3.6575},{"date":"2002-10-17T05:00:00.000Z","views":4.06},{"date":"2002-10-24T05:00:00.000Z","views":4.1175},{"date":"2002-10-31T05:00:00.000Z","views":4.0225},{"date":"2002-11-07T05:00:00.000Z","views":3.97},{"date":"2002-11-14T05:00:00.000Z","views":3.9125},{"date":"2002-11-21T05:00:00.000Z","views":3.7425},{"date":"2002-11-29T05:00:00.000Z","views":3.784},{"date":"2002-12-06T05:00:00.000Z","views":3.5775},{"date":"2002-12-13T05:00:00.000Z","views":3.53},{"date":"2002-12-20T05:00:00.000Z","views":3.4275},{"date":"2002-12-31T05:00:00.000Z","views":3.25},{"date":"2003-01-08T05:00:00.000Z","views":3.37},{"date":"2003-01-15T05:00:00.000Z","views":3.1275},{"date":"2003-01-23T05:00:00.000Z","views":3.1175},{"date":"2003-01-30T05:00:00.000Z","views":3.15},{"date":"2003-02-06T05:00:00.000Z","views":3.27},{"date":"2003-02-13T05:00:00.000Z","views":3.265},{"date":"2003-02-21T05:00:00.000Z","views":3.285},{"date":"2003-02-28T05:00:00.000Z","views":3.107},{"date":"2003-03-07T05:00:00.000Z","views":3.045},{"date":"2003-03-14T05:00:00.000Z","views":2.995},{"date":"2003-03-21T05:00:00.000Z","views":2.86},{"date":"2003-03-28T05:00:00.000Z","views":2.7925},{"date":"2003-04-04T05:00:00.000Z","views":2.85},{"date":"2003-04-11T05:00:00.000Z","views":2.8425},{"date":"2003-04-21T05:00:00.000Z","views":2.9025},{"date":"2003-04-28T05:00:00.000Z","views":2.8435},{"date":"2003-05-05T05:00:00.000Z","views":2.8875},{"date":"2003-05-12T05:00:00.000Z","views":3.31},{"date":"2003-05-19T05:00:00.000Z","views":3.285},{"date":"2003-05-27T05:00:00.000Z","views":3.275},{"date":"2003-06-03T05:00:00.000Z","views":3.195},{"date":"2003-06-10T05:00:00.000Z","views":3.3375},{"date":"2003-06-17T05:00:00.000Z","views":3.1675},{"date":"2003-06-24T05:00:00.000Z","views":3.0225},{"date":"2003-07-01T05:00:00.000Z","views":3.145},{"date":"2003-07-09T05:00:00.000Z","views":3.17},{"date":"2003-07-16T05:00:00.000Z","views":3.2075},{"date":"2003-07-23T05:00:00.000Z","views":3.4625},{"date":"2003-07-30T05:00:00.000Z","views":3.3925},{"date":"2003-08-06T05:00:00.000Z","views":3.585},{"date":"2003-08-13T05:00:00.000Z","views":3.65},{"date":"2003-08-20T05:00:00.000Z","views":3.66},{"date":"2003-08-27T05:00:00.000Z","views":3.6595},{"date":"2003-09-04T05:00:00.000Z","views":3.6775},{"date":"2003-09-11T05:00:00.000Z","views":3.5175},{"date":"2003-09-18T05:00:00.000Z","views":3.4075},{"date":"2003-09-25T05:00:00.000Z","views":3.605},{"date":"2003-10-02T05:00:00.000Z","views":3.59},{"date":"2003-10-09T05:00:00.000Z","views":3.2725},{"date":"2003-10-16T05:00:00.000Z","views":3.3625},{"date":"2003-10-23T05:00:00.000Z","views":3.695},{"date":"2003-10-30T05:00:00.000Z","views":3.69},{"date":"2003-11-06T05:00:00.000Z","views":3.755},{"date":"2003-11-13T05:00:00.000Z","views":4.0575},{"date":"2003-11-20T05:00:00.000Z","views":3.735},{"date":"2003-11-28T05:00:00.000Z","views":4.0425},{"date":"2003-12-05T05:00:00.000Z","views":4.0325},{"date":"2003-12-12T05:00:00.000Z","views":3.935},{"date":"2003-12-19T05:00:00.000Z","views":3.9425},{"date":"2003-12-29T05:00:00.000Z","views":3.64},{"date":"2004-01-06T05:00:00.000Z","views":3.945},{"date":"2004-01-13T05:00:00.000Z","views":3.92},{"date":"2004-01-21T05:00:00.000Z","views":3.92},{"date":"2004-01-28T05:00:00.000Z","views":3.7475},{"date":"2004-02-04T05:00:00.000Z","views":3.76},{"date":"2004-02-11T05:00:00.000Z","views":3.885},{"date":"2004-02-19T05:00:00.000Z","views":3.7275},{"date":"2004-02-26T05:00:00.000Z","views":3.9275},{"date":"2004-03-04T05:00:00.000Z","views":3.785},{"date":"2004-03-11T05:00:00.000Z","views":3.6125},{"date":"2004-03-18T05:00:00.000Z","views":3.98},{"date":"2004-03-25T05:00:00.000Z","views":4.08},{"date":"2004-04-01T05:00:00.000Z","views":4.105},{"date":"2004-04-08T05:00:00.000Z","views":4.145},{"date":"2004-04-16T05:00:00.000Z","views":3.885},{"date":"2004-04-23T05:00:00.000Z","views":3.73},{"date":"2004-04-30T05:00:00.000Z","views":3.883},{"date":"2004-05-07T05:00:00.000Z","views":4.03},{"date":"2004-05-14T05:00:00.000Z","views":3.585},{"date":"2004-05-21T05:00:00.000Z","views":3.6825},{"date":"2004-05-28T05:00:00.000Z","views":3.62},{"date":"2004-06-07T05:00:00.000Z","views":3.63},{"date":"2004-06-15T05:00:00.000Z","views":3.51},{"date":"2004-06-22T05:00:00.000Z","views":3.4375},{"date":"2004-06-29T05:00:00.000Z","views":3.4335},{"date":"2004-07-07T05:00:00.000Z","views":3.4825},{"date":"2004-07-14T05:00:00.000Z","views":3.45},{"date":"2004-07-21T05:00:00.000Z","views":3.24},{"date":"2004-07-28T05:00:00.000Z","views":3.1475},{"date":"2004-08-04T05:00:00.000Z","views":3.185},{"date":"2004-08-11T05:00:00.000Z","views":3.0475},{"date":"2004-08-18T05:00:00.000Z","views":3.0175},{"date":"2004-08-25T05:00:00.000Z","views":3.06},{"date":"2004-09-01T05:00:00.000Z","views":3.3025},{"date":"2004-09-09T05:00:00.000Z","views":3.2025},{"date":"2004-09-16T05:00:00.000Z","views":3.3825},{"date":"2004-09-23T05:00:00.000Z","views":3.2525},{"date":"2004-09-30T05:00:00.000Z","views":3.0675},{"date":"2004-10-07T05:00:00.000Z","views":3.0275},{"date":"2004-10-14T05:00:00.000Z","views":3.14},{"date":"2004-10-21T05:00:00.000Z","views":3.1175},{"date":"2004-10-28T05:00:00.000Z","views":3.2225},{"date":"2004-11-04T05:00:00.000Z","views":3.03},{"date":"2004-11-11T05:00:00.000Z","views":3.0275},{"date":"2004-11-18T05:00:00.000Z","views":3.1625},{"date":"2004-11-26T05:00:00.000Z","views":2.9595},{"date":"2004-12-03T05:00:00.000Z","views":3.045},{"date":"2004-12-10T05:00:00.000Z","views":2.965},{"date":"2004-12-17T05:00:00.000Z","views":3.0425},{"date":"2004-12-27T05:00:00.000Z","views":3.05},{"date":"2005-01-04T05:00:00.000Z","views":2.96},{"date":"2005-01-11T05:00:00.000Z","views":3.065},{"date":"2005-01-19T05:00:00.000Z","views":2.99},{"date":"2005-01-26T05:00:00.000Z","views":2.9525},{"date":"2005-02-02T05:00:00.000Z","views":2.8825},{"date":"2005-02-09T05:00:00.000Z","views":2.9},{"date":"2005-02-16T05:00:00.000Z","views":2.925},{"date":"2005-02-24T05:00:00.000Z","views":3.1615},{"date":"2005-03-03T05:00:00.000Z","views":3.38},{"date":"2005-03-10T05:00:00.000Z","views":3.48},{"date":"2005-03-17T05:00:00.000Z","views":3.665},{"date":"2005-03-24T05:00:00.000Z","views":3.385},{"date":"2005-04-01T05:00:00.000Z","views":3.225},{"date":"2005-04-08T05:00:00.000Z","views":3.1},{"date":"2005-04-15T05:00:00.000Z","views":3.0525},{"date":"2005-04-22T05:00:00.000Z","views":3.0925},{"date":"2005-04-29T05:00:00.000Z","views":3.244},{"date":"2005-05-06T05:00:00.000Z","views":3.17},{"date":"2005-05-13T05:00:00.000Z","views":3.0275},{"date":"2005-05-20T05:00:00.000Z","views":3.13},{"date":"2005-05-27T05:00:00.000Z","views":3.35},{"date":"2005-06-06T05:00:00.000Z","views":3.225},{"date":"2005-06-13T05:00:00.000Z","views":3.1375},{"date":"2005-06-20T05:00:00.000Z","views":3.39},{"date":"2005-06-27T05:00:00.000Z","views":3.329},{"date":"2005-07-05T05:00:00.000Z","views":3.465},{"date":"2005-07-12T05:00:00.000Z","views":3.325},{"date":"2005-07-19T05:00:00.000Z","views":3.385},{"date":"2005-07-26T05:00:00.000Z","views":3.285},{"date":"2005-08-02T05:00:00.000Z","views":3.32},{"date":"2005-08-09T05:00:00.000Z","views":3.195},{"date":"2005-08-16T05:00:00.000Z","views":3.1025},{"date":"2005-08-23T05:00:00.000Z","views":3.1725},{"date":"2005-08-30T05:00:00.000Z","views":3.1685},{"date":"2005-09-07T05:00:00.000Z","views":3.1875},{"date":"2005-09-14T05:00:00.000Z","views":3.2725},{"date":"2005-09-21T05:00:00.000Z","views":3.2525},{"date":"2005-09-28T05:00:00.000Z","views":3.2875},{"date":"2005-10-05T05:00:00.000Z","views":3.45},{"date":"2005-10-12T05:00:00.000Z","views":3.475},{"date":"2005-10-19T05:00:00.000Z","views":3.2775},{"date":"2005-10-26T05:00:00.000Z","views":3.235},{"date":"2005-11-02T05:00:00.000Z","views":3.13},{"date":"2005-11-09T05:00:00.000Z","views":3.15},{"date":"2005-11-16T05:00:00.000Z","views":3.0675},{"date":"2005-11-23T05:00:00.000Z","views":2.97},{"date":"2005-12-01T05:00:00.000Z","views":3.22},{"date":"2005-12-08T05:00:00.000Z","views":3.1225},{"date":"2005-12-15T05:00:00.000Z","views":3.1875},{"date":"2005-12-22T05:00:00.000Z","views":3.3075},{"date":"2005-12-30T05:00:00.000Z","views":3.3925},{"date":"2006-01-09T05:00:00.000Z","views":3.265},{"date":"2006-01-17T05:00:00.000Z","views":3.2875},{"date":"2006-01-24T05:00:00.000Z","views":3.325},{"date":"2006-01-31T05:00:00.000Z","views":3.4325},{"date":"2006-02-07T05:00:00.000Z","views":3.5175},{"date":"2006-02-14T05:00:00.000Z","views":3.4725},{"date":"2006-02-22T05:00:00.000Z","views":3.655},{"date":"2006-03-01T05:00:00.000Z","views":3.74},{"date":"2006-03-08T05:00:00.000Z","views":3.845},{"date":"2006-03-15T05:00:00.000Z","views":3.62},{"date":"2006-03-22T05:00:00.000Z","views":3.4925},{"date":"2006-03-29T05:00:00.000Z","views":3.4175},{"date":"2006-04-05T05:00:00.000Z","views":3.47},{"date":"2006-04-12T05:00:00.000Z","views":3.605},{"date":"2006-04-20T05:00:00.000Z","views":3.53},{"date":"2006-04-27T05:00:00.000Z","views":3.5045},{"date":"2006-05-04T05:00:00.000Z","views":3.625},{"date":"2006-05-11T05:00:00.000Z","views":3.92},{"date":"2006-05-18T05:00:00.000Z","views":4.185},{"date":"2006-05-25T05:00:00.000Z","views":4.095},{"date":"2006-06-02T05:00:00.000Z","views":4.0375},{"date":"2006-06-09T05:00:00.000Z","views":3.725},{"date":"2006-06-16T05:00:00.000Z","views":3.59},{"date":"2006-06-23T05:00:00.000Z","views":3.6325},{"date":"2006-06-30T05:00:00.000Z","views":3.911},{"date":"2006-07-10T05:00:00.000Z","views":4.03},{"date":"2006-07-17T05:00:00.000Z","views":3.93},{"date":"2006-07-24T05:00:00.000Z","views":4.005},{"date":"2006-07-31T05:00:00.000Z","views":3.975},{"date":"2006-08-07T05:00:00.000Z","views":3.93},{"date":"2006-08-14T05:00:00.000Z","views":3.74},{"date":"2006-08-21T05:00:00.000Z","views":3.6575},{"date":"2006-08-28T05:00:00.000Z","views":3.8865},{"date":"2006-09-05T05:00:00.000Z","views":4.22},{"date":"2006-09-12T05:00:00.000Z","views":4.025},{"date":"2006-09-19T05:00:00.000Z","views":4.09},{"date":"2006-09-26T05:00:00.000Z","views":4.23},{"date":"2006-10-03T05:00:00.000Z","views":4.395},{"date":"2006-10-10T05:00:00.000Z","views":5.01},{"date":"2006-10-17T05:00:00.000Z","views":5.31},{"date":"2006-10-24T05:00:00.000Z","views":5.225},{"date":"2006-10-31T05:00:00.000Z","views":4.83},{"date":"2006-11-07T05:00:00.000Z","views":4.97},{"date":"2006-11-14T05:00:00.000Z","views":4.865},{"date":"2006-11-21T05:00:00.000Z","views":4.7975},{"date":"2006-11-29T05:00:00.000Z","views":5.031},{"date":"2006-12-06T05:00:00.000Z","views":4.955},{"date":"2006-12-13T05:00:00.000Z","views":4.885},{"date":"2006-12-20T05:00:00.000Z","views":4.9375},{"date":"2006-12-28T05:00:00.000Z","views":5.0425},{"date":"2007-01-05T05:00:00.000Z","views":4.7025},{"date":"2007-01-12T05:00:00.000Z","views":4.795},{"date":"2007-01-22T05:00:00.000Z","views":4.65},{"date":"2007-01-29T05:00:00.000Z","views":4.565},{"date":"2007-02-05T05:00:00.000Z","views":4.585},{"date":"2007-02-12T05:00:00.000Z","views":4.5575},{"date":"2007-02-20T05:00:00.000Z","views":4.645},{"date":"2007-02-27T05:00:00.000Z","views":4.782},{"date":"2007-03-06T05:00:00.000Z","views":4.73},{"date":"2007-03-13T05:00:00.000Z","views":4.665},{"date":"2007-03-20T05:00:00.000Z","views":4.6275},{"date":"2007-03-27T05:00:00.000Z","views":4.54},{"date":"2007-04-03T05:00:00.000Z","views":4.19},{"date":"2007-04-11T05:00:00.000Z","views":4.5625},{"date":"2007-04-18T05:00:00.000Z","views":4.745},{"date":"2007-04-25T05:00:00.000Z","views":5.091},{"date":"2007-05-02T05:00:00.000Z","views":4.935},{"date":"2007-05-09T05:00:00.000Z","views":4.82},{"date":"2007-05-16T05:00:00.000Z","views":4.9675},{"date":"2007-05-23T05:00:00.000Z","views":4.765},{"date":"2007-05-31T05:00:00.000Z","views":5.17},{"date":"2007-06-07T05:00:00.000Z","views":5.245},{"date":"2007-06-14T05:00:00.000Z","views":6.065},{"date":"2007-06-21T05:00:00.000Z","views":6.06},{"date":"2007-06-28T05:00:00.000Z","views":6.1785},{"date":"2007-07-06T05:00:00.000Z","views":6.1},{"date":"2007-07-13T05:00:00.000Z","views":6.2075},{"date":"2007-07-20T05:00:00.000Z","views":6.1625},{"date":"2007-07-27T05:00:00.000Z","views":6.5325},{"date":"2007-08-03T05:00:00.000Z","views":6.5},{"date":"2007-08-10T05:00:00.000Z","views":6.67},{"date":"2007-08-17T05:00:00.000Z","views":6.72},{"date":"2007-08-24T05:00:00.000Z","views":7.2575},{"date":"2007-08-31T05:00:00.000Z","views":7.738},{"date":"2007-09-10T05:00:00.000Z","views":8.61},{"date":"2007-09-17T05:00:00.000Z","views":8.75},{"date":"2007-09-24T05:00:00.000Z","views":8.7775},{"date":"2007-10-01T05:00:00.000Z","views":9.525},{"date":"2007-10-08T05:00:00.000Z","views":8.6},{"date":"2007-10-15T05:00:00.000Z","views":8.335},{"date":"2007-10-22T05:00:00.000Z","views":8.71},{"date":"2007-10-29T05:00:00.000Z","views":8.285},{"date":"2007-11-05T05:00:00.000Z","views":7.85},{"date":"2007-11-12T05:00:00.000Z","views":7.61},{"date":"2007-11-19T05:00:00.000Z","views":7.5625},{"date":"2007-11-27T05:00:00.000Z","views":8.3355},{"date":"2007-12-04T05:00:00.000Z","views":8.94},{"date":"2007-12-11T05:00:00.000Z","views":9.105},{"date":"2007-12-18T05:00:00.000Z","views":9.52},{"date":"2007-12-26T05:00:00.000Z","views":9.4125},{"date":"2008-01-03T05:00:00.000Z","views":9.45},{"date":"2008-01-10T05:00:00.000Z","views":8.825},{"date":"2008-01-17T05:00:00.000Z","views":9.405},{"date":"2008-01-25T05:00:00.000Z","views":9.33},{"date":"2008-02-01T05:00:00.000Z","views":9.43},{"date":"2008-02-08T05:00:00.000Z","views":10.93},{"date":"2008-02-15T05:00:00.000Z","views":10.275},{"date":"2008-02-25T05:00:00.000Z","views":11.095},{"date":"2008-03-03T05:00:00.000Z","views":11.025},{"date":"2008-03-10T05:00:00.000Z","views":11.63},{"date":"2008-03-17T05:00:00.000Z","views":11.315},{"date":"2008-03-25T05:00:00.000Z","views":10.675},{"date":"2008-04-01T05:00:00.000Z","views":8.95},{"date":"2008-04-08T05:00:00.000Z","views":9.34},{"date":"2008-04-15T05:00:00.000Z","views":8.9575},{"date":"2008-04-22T05:00:00.000Z","views":8.5175},{"date":"2008-04-29T05:00:00.000Z","views":8.027},{"date":"2008-05-06T05:00:00.000Z","views":8.18},{"date":"2008-05-13T05:00:00.000Z","views":7.9575},{"date":"2008-05-20T05:00:00.000Z","views":7.84},{"date":"2008-05-28T05:00:00.000Z","views":7.59},{"date":"2008-06-04T05:00:00.000Z","views":7.53},{"date":"2008-06-11T05:00:00.000Z","views":8.69},{"date":"2008-06-18T05:00:00.000Z","views":9.04},{"date":"2008-06-25T05:00:00.000Z","views":9.0545},{"date":"2008-07-02T05:00:00.000Z","views":8.8025},{"date":"2008-07-10T05:00:00.000Z","views":8.18},{"date":"2008-07-17T05:00:00.000Z","views":8.095},{"date":"2008-07-24T05:00:00.000Z","views":7.8775},{"date":"2008-07-31T05:00:00.000Z","views":7.8375},{"date":"2008-08-07T05:00:00.000Z","views":8.2225},{"date":"2008-08-14T05:00:00.000Z","views":8.645},{"date":"2008-08-21T05:00:00.000Z","views":8.9725},{"date":"2008-08-28T05:00:00.000Z","views":8.022},{"date":"2008-09-05T05:00:00.000Z","views":7.515},{"date":"2008-09-12T05:00:00.000Z","views":7.1925},{"date":"2008-09-19T05:00:00.000Z","views":7.18},{"date":"2008-09-26T05:00:00.000Z","views":7.16},{"date":"2008-10-03T05:00:00.000Z","views":6.4025},{"date":"2008-10-10T05:00:00.000Z","views":5.635},{"date":"2008-10-17T05:00:00.000Z","views":5.6625},{"date":"2008-10-24T05:00:00.000Z","views":5.1625},{"date":"2008-10-31T05:00:00.000Z","views":5.3625},{"date":"2008-11-07T05:00:00.000Z","views":5.21},{"date":"2008-11-14T05:00:00.000Z","views":5.5425},{"date":"2008-11-21T05:00:00.000Z","views":4.99},{"date":"2008-12-01T05:00:00.000Z","views":5.28},{"date":"2008-12-08T05:00:00.000Z","views":4.905},{"date":"2008-12-15T05:00:00.000Z","views":5.2},{"date":"2008-12-22T05:00:00.000Z","views":5.69},{"date":"2008-12-30T05:00:00.000Z","views":6.0475},{"date":"2009-01-07T05:00:00.000Z","views":6.1325},{"date":"2009-01-14T05:00:00.000Z","views":5.7425},{"date":"2009-01-22T05:00:00.000Z","views":5.6675},{"date":"2009-01-29T05:00:00.000Z","views":5.78},{"date":"2009-02-05T05:00:00.000Z","views":5.6175},{"date":"2009-02-12T05:00:00.000Z","views":5.3875},{"date":"2009-02-20T05:00:00.000Z","views":5.1925},{"date":"2009-02-27T05:00:00.000Z","views":5.193},{"date":"2009-03-06T05:00:00.000Z","views":5.27},{"date":"2009-03-13T05:00:00.000Z","views":5.1825},{"date":"2009-03-20T05:00:00.000Z","views":5.5025},{"date":"2009-03-27T05:00:00.000Z","views":5.0725},{"date":"2009-04-03T05:00:00.000Z","views":5.635},{"date":"2009-04-13T05:00:00.000Z","views":5.2325},{"date":"2009-04-20T05:00:00.000Z","views":5.045},{"date":"2009-04-27T05:00:00.000Z","views":5.103},{"date":"2009-05-04T05:00:00.000Z","views":5.51},{"date":"2009-05-11T05:00:00.000Z","views":5.9075},{"date":"2009-05-18T05:00:00.000Z","views":5.905},{"date":"2009-05-26T05:00:00.000Z","views":6.12},{"date":"2009-06-02T05:00:00.000Z","views":6.695},{"date":"2009-06-09T05:00:00.000Z","views":6.1375},{"date":"2009-06-16T05:00:00.000Z","views":5.6575},{"date":"2009-06-23T05:00:00.000Z","views":5.4675},{"date":"2009-06-30T05:00:00.000Z","views":5.3485},{"date":"2009-07-08T05:00:00.000Z","views":5.1725},{"date":"2009-07-15T05:00:00.000Z","views":5.3475},{"date":"2009-07-22T05:00:00.000Z","views":5.22},{"date":"2009-07-29T05:00:00.000Z","views":5.115},{"date":"2009-08-05T05:00:00.000Z","views":5.2875},{"date":"2009-08-12T05:00:00.000Z","views":4.9025},{"date":"2009-08-19T05:00:00.000Z","views":4.66},{"date":"2009-08-26T05:00:00.000Z","views":4.8435},{"date":"2009-09-02T05:00:00.000Z","views":4.8575},{"date":"2009-09-10T05:00:00.000Z","views":4.5875},{"date":"2009-09-17T05:00:00.000Z","views":4.6175},{"date":"2009-09-24T05:00:00.000Z","views":4.73},{"date":"2009-10-01T05:00:00.000Z","views":4.5275},{"date":"2009-10-08T05:00:00.000Z","views":4.74},{"date":"2009-10-15T05:00:00.000Z","views":5.05},{"date":"2009-10-22T05:00:00.000Z","views":5.5175},{"date":"2009-10-29T05:00:00.000Z","views":5.0375},{"date":"2009-11-05T05:00:00.000Z","views":5.1225},{"date":"2009-11-12T05:00:00.000Z","views":5.3175},{"date":"2009-11-19T05:00:00.000Z","views":5.625},{"date":"2009-11-27T05:00:00.000Z","views":5.6135},{"date":"2009-12-04T05:00:00.000Z","views":5.58},{"date":"2009-12-11T05:00:00.000Z","views":5.375},{"date":"2009-12-18T05:00:00.000Z","views":5.28},{"date":"2009-12-28T05:00:00.000Z","views":5.5075},{"date":"2010-01-05T05:00:00.000Z","views":5.53},{"date":"2010-01-12T05:00:00.000Z","views":5.3575},{"date":"2010-01-20T05:00:00.000Z","views":4.975},{"date":"2010-01-27T05:00:00.000Z","views":4.8375},{"date":"2010-02-03T05:00:00.000Z","views":4.69},{"date":"2010-02-10T05:00:00.000Z","views":4.9675},{"date":"2010-02-18T05:00:00.000Z","views":4.85},{"date":"2010-02-25T05:00:00.000Z","views":4.9815},{"date":"2010-03-04T05:00:00.000Z","views":5.0225},{"date":"2010-03-11T05:00:00.000Z","views":4.7875},{"date":"2010-03-18T05:00:00.000Z","views":4.8925},{"date":"2010-03-25T05:00:00.000Z","views":4.665},{"date":"2010-04-01T05:00:00.000Z","views":4.5475},{"date":"2010-04-09T05:00:00.000Z","views":4.6575},{"date":"2010-04-16T05:00:00.000Z","views":4.905},{"date":"2010-04-23T05:00:00.000Z","views":4.9325},{"date":"2010-04-30T05:00:00.000Z","views":5.0075},{"date":"2010-05-07T05:00:00.000Z","views":5.105},{"date":"2010-05-14T05:00:00.000Z","views":4.715},{"date":"2010-05-21T05:00:00.000Z","views":4.72},{"date":"2010-05-28T05:00:00.000Z","views":4.5775},{"date":"2010-06-07T05:00:00.000Z","views":4.3225},{"date":"2010-06-14T05:00:00.000Z","views":4.515},{"date":"2010-06-21T05:00:00.000Z","views":4.62},{"date":"2010-06-28T05:00:00.000Z","views":4.557},{"date":"2010-07-06T05:00:00.000Z","views":5.075},{"date":"2010-07-13T05:00:00.000Z","views":5.4925},{"date":"2010-07-20T05:00:00.000Z","views":5.77},{"date":"2010-07-27T05:00:00.000Z","views":5.95},{"date":"2010-08-03T05:00:00.000Z","views":6.8},{"date":"2010-08-10T05:00:00.000Z","views":6.9475},{"date":"2010-08-17T05:00:00.000Z","views":6.51},{"date":"2010-08-24T05:00:00.000Z","views":6.7475},{"date":"2010-08-31T05:00:00.000Z","views":6.791},{"date":"2010-09-08T05:00:00.000Z","views":7.11},{"date":"2010-09-15T05:00:00.000Z","views":7.2675},{"date":"2010-09-22T05:00:00.000Z","views":7.1975},{"date":"2010-09-29T05:00:00.000Z","views":6.835},{"date":"2010-10-06T05:00:00.000Z","views":6.5825},{"date":"2010-10-13T05:00:00.000Z","views":7.0275},{"date":"2010-10-20T05:00:00.000Z","views":6.83},{"date":"2010-10-27T05:00:00.000Z","views":7.0275},{"date":"2010-11-03T05:00:00.000Z","views":6.9025},{"date":"2010-11-10T05:00:00.000Z","views":7.1},{"date":"2010-11-17T05:00:00.000Z","views":6.325},{"date":"2010-11-24T05:00:00.000Z","views":6.5505},{"date":"2010-12-02T05:00:00.000Z","views":7.485},{"date":"2010-12-09T05:00:00.000Z","views":7.885},{"date":"2010-12-16T05:00:00.000Z","views":7.4975},{"date":"2010-12-23T05:00:00.000Z","views":7.83},{"date":"2010-12-31T05:00:00.000Z","views":7.9425},{"date":"2011-01-07T05:00:00.000Z","views":7.74},{"date":"2011-01-14T05:00:00.000Z","views":7.7325},{"date":"2011-01-24T05:00:00.000Z","views":8.3525},{"date":"2011-01-31T05:00:00.000Z","views":8.4075},{"date":"2011-02-07T05:00:00.000Z","views":8.5875},{"date":"2011-02-14T05:00:00.000Z","views":8.72},{"date":"2011-02-22T05:00:00.000Z","views":7.6225},{"date":"2011-03-01T05:00:00.000Z","views":8.1025},{"date":"2011-03-08T05:00:00.000Z","views":7.7975},{"date":"2011-03-15T05:00:00.000Z","views":6.6775},{"date":"2011-03-22T05:00:00.000Z","views":7.2225},{"date":"2011-03-29T05:00:00.000Z","views":7.3725},{"date":"2011-04-05T05:00:00.000Z","views":7.8625},{"date":"2011-04-12T05:00:00.000Z","views":7.595},{"date":"2011-04-19T05:00:00.000Z","views":7.8575},{"date":"2011-04-27T05:00:00.000Z","views":7.91},{"date":"2011-05-04T05:00:00.000Z","views":7.72},{"date":"2011-05-11T05:00:00.000Z","views":7.59},{"date":"2011-05-18T05:00:00.000Z","views":8.17},{"date":"2011-05-25T05:00:00.000Z","views":7.965},{"date":"2011-06-02T05:00:00.000Z","views":7.6975},{"date":"2011-06-09T05:00:00.000Z","views":7.45},{"date":"2011-06-16T05:00:00.000Z","views":6.7325},{"date":"2011-06-23T05:00:00.000Z","views":6.49},{"date":"2011-06-30T05:00:00.000Z","views":6.0835},{"date":"2011-07-08T05:00:00.000Z","views":6.5125},{"date":"2011-07-15T05:00:00.000Z","views":6.9475},{"date":"2011-07-22T05:00:00.000Z","views":6.9225},{"date":"2011-07-29T05:00:00.000Z","views":6.725},{"date":"2011-08-05T05:00:00.000Z","views":6.79},{"date":"2011-08-12T05:00:00.000Z","views":7.025},{"date":"2011-08-19T05:00:00.000Z","views":7.3075},{"date":"2011-08-26T05:00:00.000Z","views":7.692},{"date":"2011-09-02T05:00:00.000Z","views":7.755},{"date":"2011-09-12T05:00:00.000Z","views":7.2725},{"date":"2011-09-19T05:00:00.000Z","views":6.73},{"date":"2011-09-26T05:00:00.000Z","views":6.4825},{"date":"2011-10-03T05:00:00.000Z","views":6.195},{"date":"2011-10-10T05:00:00.000Z","views":6.115},{"date":"2011-10-17T05:00:00.000Z","views":6.2425},{"date":"2011-10-24T05:00:00.000Z","views":6.425},{"date":"2011-10-31T05:00:00.000Z","views":6.2825},{"date":"2011-11-07T05:00:00.000Z","views":6.3875},{"date":"2011-11-14T05:00:00.000Z","views":6.1575},{"date":"2011-11-21T05:00:00.000Z","views":5.915},{"date":"2011-11-29T05:00:00.000Z","views":6.074},{"date":"2011-12-06T05:00:00.000Z","views":6.13},{"date":"2011-12-13T05:00:00.000Z","views":6.005},{"date":"2011-12-20T05:00:00.000Z","views":6.0775},{"date":"2011-12-28T05:00:00.000Z","views":6.5125},{"date":"2012-01-05T05:00:00.000Z","views":6.2925},{"date":"2012-01-12T05:00:00.000Z","views":6.05},{"date":"2012-01-20T05:00:00.000Z","views":6.105},{"date":"2012-01-27T05:00:00.000Z","views":6.4725},{"date":"2012-02-03T05:00:00.000Z","views":6.6075},{"date":"2012-02-10T05:00:00.000Z","views":6.3},{"date":"2012-02-17T05:00:00.000Z","views":6.44},{"date":"2012-02-27T05:00:00.000Z","views":6.4855},{"date":"2012-03-05T05:00:00.000Z","views":6.72},{"date":"2012-03-12T05:00:00.000Z","views":6.5125},{"date":"2012-03-19T05:00:00.000Z","views":6.5225},{"date":"2012-03-26T05:00:00.000Z","views":6.595},{"date":"2012-04-02T05:00:00.000Z","views":6.57},{"date":"2012-04-10T05:00:00.000Z","views":6.2575},{"date":"2012-04-17T05:00:00.000Z","views":6.155},{"date":"2012-04-24T05:00:00.000Z","views":6.245},{"date":"2012-05-01T05:00:00.000Z","views":6.43},{"date":"2012-05-08T05:00:00.000Z","views":6.15},{"date":"2012-05-15T05:00:00.000Z","views":6.085},{"date":"2012-05-22T05:00:00.000Z","views":6.855},{"date":"2012-05-30T05:00:00.000Z","views":6.5375},{"date":"2012-06-06T05:00:00.000Z","views":6.2425},{"date":"2012-06-13T05:00:00.000Z","views":6.16},{"date":"2012-06-20T05:00:00.000Z","views":6.64},{"date":"2012-06-27T05:00:00.000Z","views":7.397},{"date":"2012-07-05T05:00:00.000Z","views":8.38},{"date":"2012-07-12T05:00:00.000Z","views":8.4675},{"date":"2012-07-19T05:00:00.000Z","views":9.35},{"date":"2012-07-26T05:00:00.000Z","views":8.84},{"date":"2012-08-02T05:00:00.000Z","views":8.65},{"date":"2012-08-09T05:00:00.000Z","views":9.13},{"date":"2012-08-16T05:00:00.000Z","views":8.6175},{"date":"2012-08-23T05:00:00.000Z","views":8.745},{"date":"2012-08-30T05:00:00.000Z","views":8.952},{"date":"2012-09-07T05:00:00.000Z","views":9.05},{"date":"2012-09-14T05:00:00.000Z","views":9.2425},{"date":"2012-09-21T05:00:00.000Z","views":8.9725},{"date":"2012-09-28T05:00:00.000Z","views":9.025},{"date":"2012-10-05T05:00:00.000Z","views":8.575},{"date":"2012-10-12T05:00:00.000Z","views":8.5675},{"date":"2012-10-19T05:00:00.000Z","views":8.725},{"date":"2012-10-26T05:00:00.000Z","views":8.6375},{"date":"2012-11-02T05:00:00.000Z","views":8.645},{"date":"2012-11-09T05:00:00.000Z","views":8.865},{"date":"2012-11-16T05:00:00.000Z","views":8.38},{"date":"2012-11-26T05:00:00.000Z","views":8.49},{"date":"2012-12-03T05:00:00.000Z","views":8.6075},{"date":"2012-12-10T05:00:00.000Z","views":8.4875},{"date":"2012-12-17T05:00:00.000Z","views":8.08},{"date":"2012-12-24T05:00:00.000Z","views":7.9375},{"date":"2013-01-02T05:00:00.000Z","views":7.5525},{"date":"2013-01-09T05:00:00.000Z","views":7.455},{"date":"2013-01-16T05:00:00.000Z","views":7.85},{"date":"2013-01-24T05:00:00.000Z","views":7.685},{"date":"2013-01-31T05:00:00.000Z","views":7.795},{"date":"2013-02-07T05:00:00.000Z","views":7.56},{"date":"2013-02-14T05:00:00.000Z","views":7.32},{"date":"2013-02-22T05:00:00.000Z","views":7.15},{"date":"2013-03-01T05:00:00.000Z","views":7.205},{"date":"2013-03-08T05:00:00.000Z","views":6.97},{"date":"2013-03-15T05:00:00.000Z","views":7.23},{"date":"2013-03-22T05:00:00.000Z","views":7.2975},{"date":"2013-04-01T05:00:00.000Z","views":6.64},{"date":"2013-04-08T05:00:00.000Z","views":7.125},{"date":"2013-04-15T05:00:00.000Z","views":6.9375},{"date":"2013-04-22T05:00:00.000Z","views":7.0225},{"date":"2013-04-29T05:00:00.000Z","views":7.138},{"date":"2013-05-06T05:00:00.000Z","views":7.0275},{"date":"2013-05-13T05:00:00.000Z","views":7.0975},{"date":"2013-05-20T05:00:00.000Z","views":6.8525},{"date":"2013-05-28T05:00:00.000Z","views":6.9375},{"date":"2013-06-04T05:00:00.000Z","views":7.09},{"date":"2013-06-11T05:00:00.000Z","views":6.9675},{"date":"2013-06-18T05:00:00.000Z","views":6.875},{"date":"2013-06-25T05:00:00.000Z","views":6.776},{"date":"2013-07-02T05:00:00.000Z","views":6.5825},{"date":"2013-07-10T05:00:00.000Z","views":6.79},{"date":"2013-07-17T05:00:00.000Z","views":6.65},{"date":"2013-07-24T05:00:00.000Z","views":6.5325},{"date":"2013-07-31T05:00:00.000Z","views":6.6425},{"date":"2013-08-07T05:00:00.000Z","views":6.435},{"date":"2013-08-14T05:00:00.000Z","views":6.305},{"date":"2013-08-21T05:00:00.000Z","views":6.3875},{"date":"2013-08-28T05:00:00.000Z","views":6.517},{"date":"2013-09-05T05:00:00.000Z","views":6.4025},{"date":"2013-09-12T05:00:00.000Z","views":6.53},{"date":"2013-09-19T05:00:00.000Z","views":6.57},{"date":"2013-09-26T05:00:00.000Z","views":6.7825},{"date":"2013-10-03T05:00:00.000Z","views":6.8925},{"date":"2013-10-10T05:00:00.000Z","views":6.855},{"date":"2013-10-17T05:00:00.000Z","views":6.86},{"date":"2013-10-24T05:00:00.000Z","views":6.965},{"date":"2013-10-31T05:00:00.000Z","views":6.675},{"date":"2013-11-07T05:00:00.000Z","views":6.53},{"date":"2013-11-14T05:00:00.000Z","views":6.4475},{"date":"2013-11-21T05:00:00.000Z","views":6.4875},{"date":"2013-11-29T05:00:00.000Z","views":6.66},{"date":"2013-12-06T05:00:00.000Z","views":6.51},{"date":"2013-12-13T05:00:00.000Z","views":6.2875},{"date":"2013-12-20T05:00:00.000Z","views":6.135},{"date":"2013-12-30T05:00:00.000Z","views":6.005},{"date":"2014-01-07T05:00:00.000Z","views":6.025},{"date":"2014-01-14T05:00:00.000Z","views":5.7925},{"date":"2014-01-21T05:00:00.000Z","views":5.6225},{"date":"2014-01-28T05:00:00.000Z","views":5.66},{"date":"2014-02-04T05:00:00.000Z","views":5.845},{"date":"2014-02-11T05:00:00.000Z","views":5.9025},{"date":"2014-02-18T05:00:00.000Z","views":6.12},{"date":"2014-02-25T05:00:00.000Z","views":6.156},{"date":"2014-03-04T05:00:00.000Z","views":6.435},{"date":"2014-03-11T05:00:00.000Z","views":6.59},{"date":"2014-03-18T05:00:00.000Z","views":6.925},{"date":"2014-03-25T05:00:00.000Z","views":7.0825},{"date":"2014-04-01T05:00:00.000Z","views":6.855},{"date":"2014-04-08T05:00:00.000Z","views":6.81},{"date":"2014-04-15T05:00:00.000Z","views":7.015},{"date":"2014-04-23T05:00:00.000Z","views":6.76},{"date":"2014-04-30T05:00:00.000Z","views":7.198},{"date":"2014-05-07T05:00:00.000Z","views":7.3775},{"date":"2014-05-14T05:00:00.000Z","views":6.9025},{"date":"2014-05-21T05:00:00.000Z","views":6.6425},{"date":"2014-05-29T05:00:00.000Z","views":6.325},{"date":"2014-06-05T05:00:00.000Z","views":6.0575},{"date":"2014-06-12T05:00:00.000Z","views":5.8525},{"date":"2014-06-19T05:00:00.000Z","views":5.935},{"date":"2014-06-26T05:00:00.000Z","views":5.8325},{"date":"2014-07-03T05:00:00.000Z","views":5.795},{"date":"2014-07-11T05:00:00.000Z","views":5.26},{"date":"2014-07-18T05:00:00.000Z","views":5.3225},{"date":"2014-07-25T05:00:00.000Z","views":5.38},{"date":"2014-08-01T05:00:00.000Z","views":5.3425},{"date":"2014-08-08T05:00:00.000Z","views":5.4925},{"date":"2014-08-15T05:00:00.000Z","views":5.5125},{"date":"2014-08-22T05:00:00.000Z","views":5.52},{"date":"2014-08-29T05:00:00.000Z","views":5.6085},{"date":"2014-09-08T05:00:00.000Z","views":5.335},{"date":"2014-09-15T05:00:00.000Z","views":5.0075},{"date":"2014-09-22T05:00:00.000Z","views":4.7675},{"date":"2014-09-29T05:00:00.000Z","views":4.8125},{"date":"2014-10-06T05:00:00.000Z","views":4.915},{"date":"2014-10-13T05:00:00.000Z","views":5.0525},{"date":"2014-10-20T05:00:00.000Z","views":5.135},{"date":"2014-10-27T05:00:00.000Z","views":5.2275},{"date":"2014-11-03T05:00:00.000Z","views":5.3825},{"date":"2014-11-10T05:00:00.000Z","views":5.1725},{"date":"2014-11-17T05:00:00.000Z","views":5.5175},{"date":"2014-11-24T05:00:00.000Z","views":5.438},{"date":"2014-12-02T05:00:00.000Z","views":6.035},{"date":"2014-12-09T05:00:00.000Z","views":5.855},{"date":"2014-12-16T05:00:00.000Z","views":6.235},{"date":"2014-12-23T05:00:00.000Z","views":6.35},{"date":"2014-12-31T05:00:00.000Z","views":5.895},{"date":"2015-01-08T05:00:00.000Z","views":5.67},{"date":"2015-01-15T05:00:00.000Z","views":5.325},{"date":"2015-01-23T05:00:00.000Z","views":5.3},{"date":"2015-01-30T05:00:00.000Z","views":5.025},{"date":"2015-02-06T05:00:00.000Z","views":5.27},{"date":"2015-02-13T05:00:00.000Z","views":5.33},{"date":"2015-02-23T05:00:00.000Z","views":5.055},{"date":"2015-03-02T05:00:00.000Z","views":5.0},{"date":"2015-03-09T05:00:00.000Z","views":4.9},{"date":"2015-03-16T05:00:00.000Z","views":5.14},{"date":"2015-03-23T05:00:00.000Z","views":5.34},{"date":"2015-03-30T05:00:00.000Z","views":5.3025},{"date":"2015-04-07T05:00:00.000Z","views":5.26},{"date":"2015-04-14T05:00:00.000Z","views":4.97},{"date":"2015-04-21T05:00:00.000Z","views":5.0075},{"date":"2015-04-28T05:00:00.000Z","views":4.734},{"date":"2015-05-05T05:00:00.000Z","views":4.665},{"date":"2015-05-12T05:00:00.000Z","views":4.805},{"date":"2015-05-19T05:00:00.000Z","views":5.1025},{"date":"2015-05-27T05:00:00.000Z","views":4.8775},{"date":"2015-06-03T05:00:00.000Z","views":5.1075},{"date":"2015-06-10T05:00:00.000Z","views":5.135},{"date":"2015-06-17T05:00:00.000Z","views":4.9125},{"date":"2015-06-24T05:00:00.000Z","views":5.18},{"date":"2015-07-01T05:00:00.000Z","views":5.885},{"date":"2015-07-09T05:00:00.000Z","views":5.78},{"date":"2015-07-16T05:00:00.000Z","views":5.6225},{"date":"2015-07-23T05:00:00.000Z","views":5.215},{"date":"2015-07-30T05:00:00.000Z","views":4.965},{"date":"2015-08-06T05:00:00.000Z","views":5.07},{"date":"2015-08-13T05:00:00.000Z","views":5.0325},{"date":"2015-08-20T05:00:00.000Z","views":5.0625},{"date":"2015-08-27T05:00:00.000Z","views":4.8645},{"date":"2015-09-03T05:00:00.000Z","views":4.6525},{"date":"2015-09-11T05:00:00.000Z","views":4.85},{"date":"2015-09-18T05:00:00.000Z","views":4.8675},{"date":"2015-09-25T05:00:00.000Z","views":5.0775},{"date":"2015-10-02T05:00:00.000Z","views":5.1325},{"date":"2015-10-09T05:00:00.000Z","views":5.0925},{"date":"2015-10-16T05:00:00.000Z","views":4.9225},{"date":"2015-10-23T05:00:00.000Z","views":4.905},{"date":"2015-10-30T05:00:00.000Z","views":5.22},{"date":"2015-11-06T05:00:00.000Z","views":5.2325},{"date":"2015-11-13T05:00:00.000Z","views":4.9575},{"date":"2015-11-20T05:00:00.000Z","views":4.885},{"date":"2015-11-30T05:00:00.000Z","views":4.724},{"date":"2015-12-07T05:00:00.000Z","views":4.8275},{"date":"2015-12-14T05:00:00.000Z","views":4.935},{"date":"2015-12-21T05:00:00.000Z","views":4.79},{"date":"2015-12-29T05:00:00.000Z","views":4.7575},{"date":"2016-01-06T05:00:00.000Z","views":4.6275},{"date":"2016-01-13T05:00:00.000Z","views":4.78},{"date":"2016-01-21T05:00:00.000Z","views":4.75},{"date":"2016-01-28T05:00:00.000Z","views":4.7225},{"date":"2016-02-04T05:00:00.000Z","views":4.7275},{"date":"2016-02-11T05:00:00.000Z","views":4.5825},{"date":"2016-02-19T05:00:00.000Z","views":4.6175},{"date":"2016-02-26T05:00:00.000Z","views":4.4865},{"date":"2016-03-04T05:00:00.000Z","views":4.6075},{"date":"2016-03-11T05:00:00.000Z","views":4.7575},{"date":"2016-03-18T05:00:00.000Z","views":4.63},{"date":"2016-03-28T05:00:00.000Z","views":4.71},{"date":"2016-04-04T05:00:00.000Z","views":4.7475},{"date":"2016-04-11T05:00:00.000Z","views":4.4725},{"date":"2016-04-18T05:00:00.000Z","views":4.7275},{"date":"2016-04-25T05:00:00.000Z","views":4.7125},{"date":"2016-05-02T05:00:00.000Z","views":4.8775},{"date":"2016-05-09T05:00:00.000Z","views":4.565},{"date":"2016-05-16T05:00:00.000Z","views":4.7475},{"date":"2016-05-23T05:00:00.000Z","views":4.62},{"date":"2016-05-31T05:00:00.000Z","views":4.645},{"date":"2016-06-07T05:00:00.000Z","views":5.09},{"date":"2016-06-14T05:00:00.000Z","views":4.85},{"date":"2016-06-21T05:00:00.000Z","views":4.585},{"date":"2016-06-28T05:00:00.000Z","views":4.4915},{"date":"2016-07-06T05:00:00.000Z","views":4.285},{"date":"2016-07-13T05:00:00.000Z","views":4.3975},{"date":"2016-07-20T05:00:00.000Z","views":4.13},{"date":"2016-07-27T05:00:00.000Z","views":4.1475},{"date":"2016-08-03T05:00:00.000Z","views":4.1025},{"date":"2016-08-10T05:00:00.000Z","views":4.2175},{"date":"2016-08-17T05:00:00.000Z","views":4.26},{"date":"2016-08-24T05:00:00.000Z","views":4.04},{"date":"2016-08-31T05:00:00.000Z","views":3.828},{"date":"2016-09-08T05:00:00.000Z","views":4.06},{"date":"2016-09-15T05:00:00.000Z","views":3.995},{"date":"2016-09-22T05:00:00.000Z","views":4.055},{"date":"2016-09-29T05:00:00.000Z","views":3.99},{"date":"2016-10-06T05:00:00.000Z","views":3.9575},{"date":"2016-10-13T05:00:00.000Z","views":4.16},{"date":"2016-10-20T05:00:00.000Z","views":4.17},{"date":"2016-10-27T05:00:00.000Z","views":4.145},{"date":"2016-11-03T05:00:00.000Z","views":4.12},{"date":"2016-11-10T05:00:00.000Z","views":4.0475},{"date":"2016-11-17T05:00:00.000Z","views":4.03},{"date":"2016-11-25T05:00:00.000Z","views":4.005},{"date":"2016-12-02T05:00:00.000Z","views":4.0425},{"date":"2016-12-09T05:00:00.000Z","views":4.1625},{"date":"2016-12-16T05:00:00.000Z","views":4.0925},{"date":"2016-12-23T05:00:00.000Z","views":3.935},{"date":"2017-01-03T05:00:00.000Z","views":4.065},{"date":"2017-01-10T05:00:00.000Z","views":4.2675},{"date":"2017-01-18T05:00:00.000Z","views":4.31},{"date":"2017-01-25T05:00:00.000Z","views":4.245},{"date":"2017-02-01T05:00:00.000Z","views":4.3375},{"date":"2017-02-08T05:00:00.000Z","views":4.325},{"date":"2017-02-15T05:00:00.000Z","views":4.5475},{"date":"2017-02-23T05:00:00.000Z","views":4.411},{"date":"2017-03-02T05:00:00.000Z","views":4.5275},{"date":"2017-03-09T05:00:00.000Z","views":4.44},{"date":"2017-03-16T05:00:00.000Z","views":4.36},{"date":"2017-03-23T05:00:00.000Z","views":4.21},{"date":"2017-03-30T05:00:00.000Z","views":4.21},{"date":"2017-04-06T05:00:00.000Z","views":4.2325},{"date":"2017-04-13T05:00:00.000Z","views":4.2975},{"date":"2017-04-21T05:00:00.000Z","views":4.05},{"date":"2017-04-28T05:00:00.000Z","views":4.295},{"date":"2017-05-05T05:00:00.000Z","views":4.4225},{"date":"2017-05-12T05:00:00.000Z","views":4.3275},{"date":"2017-05-19T05:00:00.000Z","views":4.3525},{"date":"2017-05-26T05:00:00.000Z","views":4.3825},{"date":"2017-06-05T05:00:00.000Z","views":4.295},{"date":"2017-06-12T05:00:00.000Z","views":4.34},{"date":"2017-06-19T05:00:00.000Z","views":4.67},{"date":"2017-06-26T05:00:00.000Z","views":4.5},{"date":"2017-07-03T05:00:00.000Z","views":5.55},{"date":"2017-07-11T05:00:00.000Z","views":5.53},{"date":"2017-07-18T05:00:00.000Z","views":5.0375},{"date":"2017-07-25T05:00:00.000Z","views":4.74},{"date":"2017-08-01T05:00:00.000Z","views":4.6125},{"date":"2017-08-08T05:00:00.000Z","views":4.57},{"date":"2017-08-15T05:00:00.000Z","views":4.295},{"date":"2017-08-22T05:00:00.000Z","views":4.0225},{"date":"2017-08-29T05:00:00.000Z","views":4.1355},{"date":"2017-09-06T05:00:00.000Z","views":4.4575},{"date":"2017-09-13T05:00:00.000Z","views":4.4325},{"date":"2017-09-20T05:00:00.000Z","views":4.4975},{"date":"2017-09-27T05:00:00.000Z","views":4.615},{"date":"2017-10-04T05:00:00.000Z","views":4.42},{"date":"2017-10-11T05:00:00.000Z","views":4.3325},{"date":"2017-10-18T05:00:00.000Z","views":4.3},{"date":"2017-10-25T05:00:00.000Z","views":4.355},{"date":"2017-11-01T05:00:00.000Z","views":4.18},{"date":"2017-11-08T05:00:00.000Z","views":4.2675},{"date":"2017-11-15T05:00:00.000Z","views":4.2},{"date":"2017-11-22T05:00:00.000Z","views":4.2275},{"date":"2017-11-30T05:00:00.000Z","views":4.2825},{"date":"2017-12-07T05:00:00.000Z","views":4.215},{"date":"2017-12-14T05:00:00.000Z","views":4.1825},{"date":"2017-12-21T05:00:00.000Z","views":4.27},{"date":"2017-12-29T05:00:00.000Z","views":4.27},{"date":"2018-01-08T05:00:00.000Z","views":4.2775},{"date":"2018-01-16T05:00:00.000Z","views":4.165},{"date":"2018-01-23T05:00:00.000Z","views":4.215},{"date":"2018-01-30T05:00:00.000Z","views":4.5725},{"date":"2018-02-06T05:00:00.000Z","views":4.4625},{"date":"2018-02-13T05:00:00.000Z","views":4.6075},{"date":"2018-02-21T05:00:00.000Z","views":4.4725},{"date":"2018-02-28T05:00:00.000Z","views":4.929},{"date":"2018-03-07T05:00:00.000Z","views":4.9725},{"date":"2018-03-14T05:00:00.000Z","views":4.8875},{"date":"2018-03-21T05:00:00.000Z","views":4.535},{"date":"2018-03-28T05:00:00.000Z","views":4.455},{"date":"2018-04-05T05:00:00.000Z","views":4.6475},{"date":"2018-04-12T05:00:00.000Z","views":4.81},{"date":"2018-04-19T05:00:00.000Z","views":4.7675},{"date":"2018-04-26T05:00:00.000Z","views":4.8425},{"date":"2018-05-03T05:00:00.000Z","views":5.38},{"date":"2018-05-10T05:00:00.000Z","views":5.065},{"date":"2018-05-17T05:00:00.000Z","views":4.975},{"date":"2018-05-24T05:00:00.000Z","views":5.3025},{"date":"2018-06-01T05:00:00.000Z","views":5.2325},{"date":"2018-06-08T05:00:00.000Z","views":5.2},{"date":"2018-06-15T05:00:00.000Z","views":4.995},{"date":"2018-06-22T05:00:00.000Z","views":4.9125},{"date":"2018-06-29T05:00:00.000Z","views":5.005},{"date":"2018-07-09T05:00:00.000Z","views":5.08},{"date":"2018-07-16T05:00:00.000Z","views":4.885},{"date":"2018-07-23T05:00:00.000Z","views":5.1375},{"date":"2018-07-30T05:00:00.000Z","views":5.465},{"date":"2018-08-06T05:00:00.000Z","views":5.745},{"date":"2018-08-13T05:00:00.000Z","views":5.335},{"date":"2018-08-20T05:00:00.000Z","views":5.4225},{"date":"2018-08-27T05:00:00.000Z","views":4.9925},{"date":"2018-09-04T05:00:00.000Z","views":5.315},{"date":"2018-09-11T05:00:00.000Z","views":5.1875},{"date":"2018-09-18T05:00:00.000Z","views":5.105},{"date":"2018-09-25T05:00:00.000Z","views":5.2075},{"date":"2018-10-02T05:00:00.000Z","views":5.1925},{"date":"2018-10-09T05:00:00.000Z","views":5.15},{"date":"2018-10-16T05:00:00.000Z","views":5.235},{"date":"2018-10-23T05:00:00.000Z","views":5.09},{"date":"2018-10-30T05:00:00.000Z","views":4.9975},{"date":"2018-11-06T05:00:00.000Z","views":5.12},{"date":"2018-11-13T05:00:00.000Z","views":5.0775},{"date":"2018-11-20T05:00:00.000Z","views":5.0075},{"date":"2018-11-28T05:00:00.000Z","views":5.031},{"date":"2018-12-05T05:00:00.000Z","views":5.18},{"date":"2018-12-12T05:00:00.000Z","views":5.265},{"date":"2018-12-19T05:00:00.000Z","views":5.225},{"date":"2018-12-27T05:00:00.000Z","views":5.105},{"date":"2019-01-04T05:00:00.000Z","views":5.17},{"date":"2019-01-11T05:00:00.000Z","views":5.195},{"date":"2019-01-18T05:00:00.000Z","views":5.1775},{"date":"2019-01-28T05:00:00.000Z","views":5.1875},{"date":"2019-02-04T05:00:00.000Z","views":5.2575},{"date":"2019-02-11T05:00:00.000Z","views":5.1825},{"date":"2019-02-19T05:00:00.000Z","views":4.8975},{"date":"2019-02-26T05:00:00.000Z","views":4.6345},{"date":"2019-03-05T05:00:00.000Z","views":4.6275},{"date":"2019-03-12T05:00:00.000Z","views":4.53},{"date":"2019-03-19T05:00:00.000Z","views":4.565},{"date":"2019-03-26T05:00:00.000Z","views":4.6925},{"date":"2019-04-02T05:00:00.000Z","views":4.64},{"date":"2019-04-09T05:00:00.000Z","views":4.595},{"date":"2019-04-16T05:00:00.000Z","views":4.45},{"date":"2019-04-24T05:00:00.000Z","views":4.3225},{"date":"2019-05-01T05:00:00.000Z","views":4.36},{"date":"2019-05-08T05:00:00.000Z","views":4.39},{"date":"2019-05-15T05:00:00.000Z","views":4.4875},{"date":"2019-05-22T05:00:00.000Z","views":4.7275},{"date":"2019-05-30T05:00:00.000Z","views":5.145},{"date":"2019-06-06T05:00:00.000Z","views":5.1},{"date":"2019-06-13T05:00:00.000Z","views":5.355},{"date":"2019-06-20T05:00:00.000Z","views":5.265},{"date":"2019-06-27T05:00:00.000Z","views":5.4705},{"date":"2019-07-05T05:00:00.000Z","views":5.15},{"date":"2019-07-12T05:00:00.000Z","views":5.23},{"date":"2019-07-19T05:00:00.000Z","views":5.025},{"date":"2019-07-26T05:00:00.000Z","views":4.96},{"date":"2019-08-02T05:00:00.000Z","views":4.9075},{"date":"2019-08-09T05:00:00.000Z","views":4.995},{"date":"2019-08-16T05:00:00.000Z","views":4.7075},{"date":"2019-08-23T05:00:00.000Z","views":4.7525},{"date":"2019-08-30T05:00:00.000Z","views":4.6025},{"date":"2019-09-09T05:00:00.000Z","views":4.745},{"date":"2019-09-16T05:00:00.000Z","views":4.8875},{"date":"2019-09-23T05:00:00.000Z","views":4.83},{"date":"2019-09-30T05:00:00.000Z","views":4.9575},{"date":"2019-10-07T05:00:00.000Z","views":4.8925},{"date":"2019-10-14T05:00:00.000Z","views":5.11},{"date":"2019-10-21T05:00:00.000Z","views":5.235},{"date":"2019-10-28T05:00:00.000Z","views":5.1175},{"date":"2019-11-04T05:00:00.000Z","views":5.0975},{"date":"2019-11-11T05:00:00.000Z","views":5.0575},{"date":"2019-11-18T05:00:00.000Z","views":5.0725},{"date":"2019-11-25T05:00:00.000Z","views":5.314},{"date":"2019-12-03T05:00:00.000Z","views":5.2525},{"date":"2019-12-10T05:00:00.000Z","views":5.2375},{"date":"2019-12-17T05:00:00.000Z","views":5.5625},{"date":"2019-12-24T05:00:00.000Z","views":5.41},{"date":"2020-01-02T05:00:00.000Z","views":5.6025},{"date":"2020-01-09T05:00:00.000Z","views":5.6225},{"date":"2020-01-16T05:00:00.000Z","views":5.6525},{"date":"2020-01-24T05:00:00.000Z","views":5.735},{"date":"2020-01-31T05:00:00.000Z","views":5.5375},{"date":"2020-02-07T05:00:00.000Z","views":5.5875},{"date":"2020-02-14T05:00:00.000Z","views":5.4275},{"date":"2020-02-24T05:00:00.000Z","views":5.3625},{"date":"2020-03-02T05:00:00.000Z","views":5.2325},{"date":"2020-03-09T05:00:00.000Z","views":5.1875},{"date":"2020-03-16T05:00:00.000Z","views":4.98},{"date":"2020-03-23T05:00:00.000Z","views":5.625},{"date":"2020-03-30T05:00:00.000Z","views":5.695},{"date":"2020-04-06T05:00:00.000Z","views":5.5575},{"date":"2020-04-14T05:00:00.000Z","views":5.4875},{"date":"2020-04-21T05:00:00.000Z","views":5.4675},{"date":"2020-04-28T05:00:00.000Z","views":5.2645},{"date":"2020-05-05T05:00:00.000Z","views":5.2075},{"date":"2020-05-12T05:00:00.000Z","views":5.145},{"date":"2020-05-19T05:00:00.000Z","views":4.9875},{"date":"2020-05-27T05:00:00.000Z","views":5.045},{"date":"2020-06-03T05:00:00.000Z","views":5.12},{"date":"2020-06-10T05:00:00.000Z","views":5.0625},{"date":"2020-06-17T05:00:00.000Z","views":4.8875},{"date":"2020-06-24T05:00:00.000Z","views":4.8125},{"date":"2020-07-01T05:00:00.000Z","views":4.9875},{"date":"2020-07-09T05:00:00.000Z","views":5.25},{"date":"2020-07-16T05:00:00.000Z","views":5.3525},{"date":"2020-07-23T05:00:00.000Z","views":5.295},{"date":"2020-07-30T05:00:00.000Z","views":5.295},{"date":"2020-08-06T05:00:00.000Z","views":5.0125},{"date":"2020-08-13T05:00:00.000Z","views":4.9675},{"date":"2020-08-20T05:00:00.000Z","views":5.195},{"date":"2020-08-27T05:00:00.000Z","views":5.458},{"date":"2020-09-03T05:00:00.000Z","views":5.5325},{"date":"2020-09-11T05:00:00.000Z","views":5.42},{"date":"2020-09-18T05:00:00.000Z","views":5.75},{"date":"2020-09-25T05:00:00.000Z","views":5.4425},{"date":"2020-10-02T05:00:00.000Z","views":5.7325},{"date":"2020-10-09T05:00:00.000Z","views":5.9375},{"date":"2020-10-16T05:00:00.000Z","views":6.2525},{"date":"2020-10-23T05:00:00.000Z","views":6.3275},{"date":"2020-10-30T05:00:00.000Z","views":5.985},{"date":"2020-11-06T05:00:00.000Z","views":6.02},{"date":"2020-11-13T05:00:00.000Z","views":5.935},{"date":"2020-11-20T05:00:00.000Z","views":5.9325},{"date":"2020-11-30T05:00:00.000Z","views":5.8405},{"date":"2020-12-07T05:00:00.000Z","views":5.775},{"date":"2020-12-14T05:00:00.000Z","views":5.965},{"date":"2020-12-21T05:00:00.000Z","views":6.1125},{"date":"2020-12-29T05:00:00.000Z","views":6.185},{"date":"2021-01-06T05:00:00.000Z","views":6.475},{"date":"2021-01-13T05:00:00.000Z","views":6.605},{"date":"2021-01-21T05:00:00.000Z","views":6.6075},{"date":"2021-01-28T05:00:00.000Z","views":6.47},{"date":"2021-02-04T05:00:00.000Z","views":6.375},{"date":"2021-02-11T05:00:00.000Z","views":6.335},{"date":"2021-02-19T05:00:00.000Z","views":6.5075},{"date":"2021-02-26T05:00:00.000Z","views":6.592},{"date":"2021-03-05T05:00:00.000Z","views":6.53},{"date":"2021-03-12T05:00:00.000Z","views":6.385},{"date":"2021-03-19T05:00:00.000Z","views":6.27},{"date":"2021-03-26T05:00:00.000Z","views":6.1325},{"date":"2021-04-05T05:00:00.000Z","views":6.18},{"date":"2021-04-12T05:00:00.000Z","views":6.28},{"date":"2021-04-19T05:00:00.000Z","views":6.5225},{"date":"2021-04-26T05:00:00.000Z","views":7.395},{"date":"2021-05-03T05:00:00.000Z","views":7.18},{"date":"2021-05-10T05:00:00.000Z","views":7.305},{"date":"2021-05-17T05:00:00.000Z","views":6.9975},{"date":"2021-05-24T05:00:00.000Z","views":6.6225},{"date":"2021-06-01T05:00:00.000Z","views":6.935},{"date":"2021-06-08T05:00:00.000Z","views":6.85},{"date":"2021-06-15T05:00:00.000Z","views":6.615},{"date":"2021-06-22T05:00:00.000Z","views":6.51},{"date":"2021-06-29T05:00:00.000Z","views":6.4365},{"date":"2021-07-07T05:00:00.000Z","views":6.2225},{"date":"2021-07-14T05:00:00.000Z","views":6.5425},{"date":"2021-07-21T05:00:00.000Z","views":7.1075},{"date":"2021-07-28T05:00:00.000Z","views":6.8875},{"date":"2021-08-04T05:00:00.000Z","views":7.1725},{"date":"2021-08-11T05:00:00.000Z","views":7.27},{"date":"2021-08-18T05:00:00.000Z","views":7.3725},{"date":"2021-08-25T05:00:00.000Z","views":7.1125},{"date":"2021-09-01T05:00:00.000Z","views":7.1425},{"date":"2021-09-08T05:00:00.000Z","views":7.095},{"date":"2021-09-15T05:00:00.000Z","views":7.1225},{"date":"2021-09-22T05:00:00.000Z","views":7.0575},{"date":"2021-09-29T05:00:00.000Z","views":7.1025},{"date":"2021-10-06T05:00:00.000Z","views":7.46},{"date":"2021-10-13T05:00:00.000Z","views":7.1875},{"date":"2021-10-20T05:00:00.000Z","views":7.4925},{"date":"2021-10-27T05:00:00.000Z","views":7.5975},{"date":"2021-11-03T05:00:00.000Z","views":7.81},{"date":"2021-11-10T05:00:00.000Z","views":8.03},{"date":"2021-11-17T05:00:00.000Z","views":8.2225},{"date":"2021-11-24T05:00:00.000Z","views":8.3945},{"date":"2021-12-02T05:00:00.000Z","views":8.15},{"date":"2021-12-09T05:00:00.000Z","views":7.7675},{"date":"2021-12-16T05:00:00.000Z","views":7.705},{"date":"2021-12-23T05:00:00.000Z","views":8.1475},{"date":"2021-12-29T05:00:00.000Z","views":7.8775},{"date":"2022-01-05T05:00:00.000Z","views":7.6075},{"date":"2022-01-12T05:00:00.000Z","views":7.5775},{"date":"2022-01-20T05:00:00.000Z","views":7.9025},{"date":"2022-01-27T05:00:00.000Z","views":7.77},{"date":"2022-02-03T05:00:00.000Z","views":7.5175},{"date":"2022-02-10T05:00:00.000Z","views":7.715},{"date":"2022-02-17T05:00:00.000Z","views":7.98},{"date":"2022-02-24T05:00:00.000Z","views":9.295},{"date":"2022-03-03T05:00:00.000Z","views":11.34},{"date":"2022-03-10T05:00:00.000Z","views":10.87},{"date":"2022-03-17T05:00:00.000Z","views":10.98},{"date":"2022-03-24T05:00:00.000Z","views":10.8575},{"date":"2022-03-31T05:00:00.000Z","views":10.06},{"date":"2022-04-07T05:00:00.000Z","views":10.2},{"date":"2022-04-14T05:00:00.000Z","views":10.965},{"date":"2022-04-21T05:00:00.000Z","views":10.68},{"date":"2022-04-28T05:00:00.000Z","views":10.8105},{"date":"2022-05-05T05:00:00.000Z","views":11.065},{"date":"2022-05-12T05:00:00.000Z","views":11.7875},{"date":"2022-05-19T05:00:00.000Z","views":12.005},{"date":"2022-05-26T05:00:00.000Z","views":11.4325},{"date":"2022-06-03T05:00:00.000Z","views":10.4},{"date":"2022-06-10T05:00:00.000Z","views":10.7075},{"date":"2022-06-17T05:00:00.000Z","views":10.3425},{"date":"2022-06-24T05:00:00.000Z","views":9.2375}]
)}

function _t(csearch,wheat){return(
csearch(wheat)
)}

function _csearch(){return(
function csearch(data) {
  data = typeof data == "string" ? JSON.parse(data) : data
  data.forEach(d => d.date = new Date(d.date)) // undo serialization
  //cache[query] = JSON.stringify(data)
  return data
}
)}

function _search(dateToTimestamp,d3,dayDiff,parseDateString){return(
function search(query, startDate, endDate) {

  let project = "en.wikipedia"
  let article = encodeURIComponent(query)
  let granularity = "daily"
  let access = "all-access"
  let agent = "user"

  let date 
  
  let url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${project}/${access}/${agent}/${article}/${granularity}/${dateToTimestamp(startDate)}/${dateToTimestamp(endDate)}`
  console.log(query, url)
  return d3.json(url)
  .catch(e => ({ items: [] }))
  .then(d => d.items)
  .then(items => {
    // Fill in missing days with zeroes
    let result = new Array(dayDiff(startDate, endDate) + 1).fill(null)
    items.forEach(d => {
      d.date = parseDateString(d.timestamp)
      result[dayDiff(startDate, d.date)] = d
    })
    
    result.forEach((d, i) => {
      if (d === null) {
        let date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
        result[i] = Object.assign({
          project,
          article,
          granularity,
          timestamp: dateToTimestamp(date),
          access,
          agent,
          views: 0,
          date: date
        })
      }
    })
    
    result.sort((a, b) => d3.ascending(a.date, b.date))
    return result
  })
}
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["valkyrie_c3_regular.woff", {url: new URL("./files/f42baa3634c5250ca2f0debe8445e726fa6148ad0209f7403c34755e6d0084c8d67d14c06eac3348f3100cec395869ad8c8e18fd516c4f0681a2157b620c6d46.woff", import.meta.url), mimeType: "font/woff", toString}],
    ["valkyrie_t4_bold_italic.woff", {url: new URL("./files/cea5b7a361c0c0a0e99b4b1bc3d4618085be813c804ee00dd123f45cbf70ef817bd198e030a1d11899a36bf7ee71be1204dde022a02c8d0685c714f511edc9a1.woff", import.meta.url), mimeType: "font/woff", toString}],
    ["valkyrie_c4_bold.woff", {url: new URL("./files/1cab2f53e79b4ae2fd5dd21f723153763f6202ac37dfcc9517b5bad8c1a04d1915ec94f48f7d5a3ad0daedeaf1a0d751de6a0d4bf1182731b8983f14a4213383.woff", import.meta.url), mimeType: "font/woff", toString}],
    ["valkyrie_c4_regular.woff", {url: new URL("./files/c49f9e2d1fe86673b842862cfedfeb14fc85312f24b3e8dc9cc56803a5e368b78419f07ccc35af9ef1906faebc82bf941093a38289dd309828782473e3dd32dc.woff", import.meta.url), mimeType: "font/woff", toString}],
    ["valkyrie_t4_italic.woff", {url: new URL("./files/d5979828fcfc97c2dbc329d434720ccf099cf4461591c907f24f1fef2761c2e8acf417561e15cc64fa7f9ecfba38b98b71c46b2500aa26fcbc0b434ebece48c0.woff", import.meta.url), mimeType: "font/woff", toString}],
    ["valkyrie_t4_regular.woff", {url: new URL("./files/dc785e05fa768950eff0fa567988dfbe1726cef38d741ed5fff2cfafa41f5dcb4d39a2e802be9660d4517289736eb784f3bb2919b32fc07b8c3b1404c0983ee2.woff", import.meta.url), mimeType: "font/woff", toString}],
    ["valkyrie_c3_bold.woff", {url: new URL("./files/d033860f96bad76ac68f299731393aec5e6b804d69d6ee26c330258934d902394c06c8593b1176d07145c1cab1ac620a5d4e7ffba65ce1789466d0be52c6e142.woff", import.meta.url), mimeType: "font/woff", toString}],
    ["valkyrie_t4_bold.woff", {url: new URL("./files/22dbffcb8c46dc452166d5ea523143870b4a5202618d32ef389632f2102a4bfabfe32d7d8e974eb9a257541843ca6546e75dc545173c2cf344e6af20b152d50a.woff", import.meta.url), mimeType: "font/woff", toString}],
    ["concourse_t4_bold.woff", {url: new URL("./files/8d21be38e50ccc3d1dd9c87e094e4bcc9c7e61e94d1d6659426c9e72c683f6df2144fe2511e174e29224f5a3c6dfad63b4632a77450d5f6185626f038f2db46c.woff", import.meta.url), mimeType: "font/woff", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("wheat_plot")).define("wheat_plot", ["plotData","wheat"], _wheat_plot);
  main.variable(observer("detectPeaks")).define("detectPeaks", ["normalize","peakiness","max","d3"], _detectPeaks);
  main.variable(observer("peakiness")).define("peakiness", ["d3"], _peakiness);
  main.variable(observer("normalize")).define("normalize", ["d3"], _normalize);
  main.variable(observer("line")).define("line", ["d3","curve"], _line);
  main.variable(observer("curve")).define("curve", ["d3"], _curve);
  main.variable(observer("chart")).define("chart", ["xscale","detectPeaks","d3","start","end","peakOffsets","width","pink","arrow","html","short"], _chart);
  main.variable(observer("hover")).define("hover", ["d3","xscale","identity","findmin","width","abs","dateToTimestamp","comma"], _hover);
  main.variable(observer("plot")).define("plot", ["csearch","plotData"], _plot);
  main.variable(observer("plotData")).define("plotData", ["chart","html","hover","d3"], _plotData);
  main.variable(observer()).define(["html","reddish","width"], _11);
  main.variable(observer("timeSeriesStyle")).define("timeSeriesStyle", ["html","gray","xscale","end"], _timeSeriesStyle);
  main.variable(observer("xscale")).define("xscale", ["d3","start","end","width"], _xscale);
  main.variable(observer("short")).define("short", ["d3"], _short);
  main.variable(observer("peakOffsets")).define("peakOffsets", ["mod"], _peakOffsets);
  main.variable(observer("findmax")).define("findmax", ["identity"], _findmax);
  main.variable(observer("findmin")).define("findmin", ["identity"], _findmin);
  main.variable(observer("comma")).define("comma", ["d3"], _comma);
  main.variable(observer("peakLabel")).define("peakLabel", _peakLabel);
  main.variable(observer("shortNum")).define("shortNum", ["d3"], _shortNum);
  main.variable(observer("arrow")).define("arrow", _arrow);
  main.variable(observer("start")).define("start", _start);
  main.variable(observer("end")).define("end", _end);
  main.variable(observer("abs")).define("abs", _abs);
  main.variable(observer("dateToTimestamp")).define("dateToTimestamp", _dateToTimestamp);
  main.variable(observer("parseDateString")).define("parseDateString", _parseDateString);
  main.variable(observer("dayDiff")).define("dayDiff", _dayDiff);
  main.variable(observer("count")).define("count", _count);
  main.variable(observer("identity")).define("identity", _identity);
  main.variable(observer("max")).define("max", _max);
  main.variable(observer("fontStyle")).define("fontStyle", ["html"], _fontStyle);
  main.variable(observer("files")).define("files", ["FileAttachment"], _files);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("mod")).define("mod", _mod);
  main.variable(observer("reddish")).define("reddish", _reddish);
  main.variable(observer("pink")).define("pink", _pink);
  main.variable(observer("gray")).define("gray", _gray);
  main.variable(observer("wheat")).define("wheat", _wheat);
  main.variable(observer("t")).define("t", ["csearch","wheat"], _t);
  main.variable(observer("csearch")).define("csearch", _csearch);
  main.variable(observer("search")).define("search", ["dateToTimestamp","d3","dayDiff","parseDateString"], _search);
  return main;
}
