function _1(md) {
	return md`
# d3.blur

[**d3.blur**](https://github.com/d3/d3-array/blob/main/README.md#blur) smooths an array of numbers by distributing the value of each element onto its neighbors. The transformation is made via three applications of a fast moving-average window transform of radius _r_.
	`;
}

function _2(md) {
	return md`
For example, here is a blurred random walk:
	`;
}

function _randomWalk(d3) {
	return d3.cumsum({ length: 401 }, () => Math.random() - 0.5);
}

function _blurredWalk(d3, randomWalk) {
	return d3.blur(randomWalk.slice(), 3);
}

function _chart(Plot, randomWalk, blurredWalk) {
	return Plot.plot({
		nice: true,
		grid: true,
		height: 400,
		width: 1000,
		style: {
			background: '#FAFAFA',
			color: '#5b5b5b'
		},
		marks: [
			Plot.lineY(randomWalk, { strokeWidth: 0.7 }),
			Plot.lineY(blurredWalk, { stroke: 'red' })
		]
	});
}

function _6(md) {
	return md`
Assuming all the values in the input are well defined, the blurred array is likewise complete: it has the same length and all its values are well defined. This contrasts with the classical moving average in which the either the first or the last values are not defined. From the perspective of the blur operator, the first and last value of the series are considered to extend infinitely. The derivative of the blurred series thus tends towards zero (above, horizontal) near the start and end.
	`;
}

function _7(md) {
	return md`
Blurring is sometimes called _smoothing_ or _low-pass filtering_ since it removes high-frequency jumps (rapid changes) in data. It may also be called a _Gaussian blur_ since it approximates a convolution with a Gaussian kernel. The chart below shows, <span style="color:steelblue">in blue</span>, how a mass of 1 concentrated in the center of an array ends up being distributed; the corresponding Gaussian kernel is drawn <span style="color:red">in red</span>.
	`;
}

function _8(d3, r, Plot) {
	const n = 40;
	const A = new Array(2 * n + 1).fill(0);
	A[n] = 1;
	d3.blur(A, r);

	// evaluate the corresponding gaussian curve’s standard deviation
	const sigma = Math.sqrt(d3.sum(A, (y, i) => y * (i - n) ** 2));

	return Plot.plot({
		height: 200,
		width: 600,
		marks: [
			Plot.lineY(A, { curve: 'step', stroke: 'steelblue' }),
			Plot.lineY(
				A.map(
					sigma ? (d, i) => Math.exp(-(((i - n) / sigma) ** 2) / 2) * A[n] : (d, i) => +(i === n) // when r = 0
				),
				{ stroke: 'red', strokeDasharray: 3 }
			)
		]
	});
}

function _r(Inputs) {
	return Inputs.range([0, 10], { label: 'Radius', step: 0.01, value: 1 });
}

function _10(tex, md) {
	return md`For the curious, here’s how the Gaussian curve’s standard deviation ${tex`\sigma`} varies with ${tex`r`} on an array of 20 values.`;
}

function _11(d3, Plot, r) {
	const n = 20;
	const A = new Array(2 * n + 1);

	function sigma(r) {
		A.fill(0);
		A[n] = 1;
		d3.blur(A, r);
		// evaluate the corresponding gaussian curve’s standard deviation
		return Math.sqrt(d3.sum(A, (y, i) => y * (i - n) ** 2));
	}

	return Plot.plot({
		zero: true,
		grid: true,
		x: { label: 'r →', ticks: 11 },
		y: { label: '↑ sigma', ticks: 11 },
		marks: [
			Plot.ruleX([0]),
			Plot.ruleY([0]),
			Plot.line(d3.range(0.01, 10.1, 0.1), { x: (r) => r, y: (r) => sigma(r), stroke: 'red' }),
			Plot.dot([r], { x: (r) => r, y: (r) => sigma(r), stroke: 'red' }),
			Plot.line(d3.range(0.01, 10.1, 0.1), {
				x: (r) => r,
				y: (r) => r + 0.5,
				strokeWidth: 0.7,
				strokeDasharray: 3
			}),
			Plot.dot([r], { x: (r) => r, y: r + 0.5, strokeWidth: 0.7 }),
			Plot.text(
				{ length: 1 },
				{ text: ['σ = r +  ½ →'], x: 9.4, y: 10, fontStyle: 'italic', frameAnchor: 'right' }
			)
		]
	});
}

function _12(tex, md) {
	return md`As a rule of thumb, ${tex`\sigma \approxeq r + \frac{1}{2}`}. Fractional values of ${tex`r`} slightly stray away from this rule. The linear relation between ${tex`r`} and ${tex`\sigma`} also breaks down when the blurring reaches an edge of the array (here ${tex`r = 8`}).`;
}

function _13(md) {
	return md`
[**d3.blur2**](https://github.com/d3/d3-array/blob/main/README.md#blur2) is the two-dimensional variant of d3.blur: it blurs a rectangular grid (or matrix) of values. Call it by passing a {_data_, _width_, _height_} object and _radius_. (The _height_ parameter is optional and defaults to ⌊_data_.length / _width_⌋ if undefined.)
	`;
}

function _14(d3) {
	return d3.blur2(
		{
			data: [1, 0, 0, 0, 0, 0, 0, 0, 1],
			width: 3,
			height: 3
		},
		1
	);
}

function _15(md) {
	return md`
The following chart shows how a central mass of 1 is blurred onto a 11&times;11 matrix:
	`;
}

function _16(Plot, d3, r2) {
	return Plot.plot({
		width: 400,
		height: 400,
		margin: 0,
		grid: true,
		x: { type: 'point', tickSize: 0, tickFormat: null },
		y: { type: 'point', tickSize: 0, tickFormat: null },
		r: {
			domain: [0, 1],
			range: [0, 40]
		},
		marks: [
			Plot.dot(
				d3.blur2(
					{
						width: 11,
						height: 11,
						data: [
							0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
							0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
							0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
							0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
							0, 0, 0, 0, 0
						]
					},
					r2
				).data,
				{
					fill: 'currentColor',
					x: (d, i) => i % 11,
					y: (d, i) => Math.floor(i / 11),
					r: (d) => d
				}
			)
		]
	});
}

function _r2(Inputs) {
	return Inputs.range([0, 10], { label: 'Radius', step: 0.01, value: 1 });
}

function _18(md) {
	return md`
d3.blur2 accepts a second (optional) radius, should you need to apply a different horizontal radius _rx_ and vertical radius _ry_. Gaussian blurring is a separable filter, and hence d3.blur2 is implemented as a horizontal and a vertical blur.
	`;
}

function _19(md) {
	return md`
Since the transformation approximates a Gaussian kernel, blurring is almost rotationally invariant (in other words, the result depends on the Euclidian distance from the central point). This makes it particularly useful to draw [density contours](/@d3/density-contours).
	`;
}

function _20(md) {
	return md`
A common use case for this function is the blurring of a grayscale image:
	`;
}

function _pixels() {
	return {
		width: 40,
		data: Array.from({ length: 40 * 20 }, (_, i) => (i % 40) * Math.random())
	};
}

function _blurred(d3, pixels) {
	return d3.blur2({ data: pixels.data.slice(), width: pixels.width }, 0.5);
}

function _23(htl, Plot, pixels, blurred) {
	return htl.html`<div style="display: inline-block; margin-right: 20px;">${Plot.plot({
		caption: 'pixels',
		marks: [
			Plot.cell(pixels.data, {
				x: (d, i) => i % pixels.width,
				y: (d, i) => Math.floor(i / pixels.width),
				fill: (d) => d,
				inset: -0.5 // fill seems
			}),
			Plot.frame()
		],
		padding: 0,
		round: false,
		color: { scheme: 'greys', domain: [0, 20] },
		height: 200,
		width: 300,
		axis: null
	})}</div>
<div style="display: inline-block;">${Plot.plot({
		caption: 'blurred',
		marks: [
			Plot.cell(blurred.data, {
				x: (d, i) => i % pixels.width,
				y: (d, i) => Math.floor(i / pixels.width),
				fill: (d) => d,
				inset: -0.5 // fill seems
			}),
			Plot.frame()
		],
		padding: 0,
		round: false,
		color: { scheme: 'greys', domain: [0, 20] },
		height: 200,
		width: 300,
		axis: null
	})}`;
}

function _24(md) {
	return md`
See [cloud contours](https://observablehq.com/@d3/cloud-contours) for a more detailed example of blurring of a grayscale image.
	`;
}

function _25(md) {
	return md`
If the input array contains undefined or NaN values, beware that the nearby (and even not-so-nearby) corresponding output values will be NaN. Also beware that null input values will be implicitly coerced to zero. If this is not what you want, then replace undefined values in the input array with an appropriate replacement value before blurring, or consider blurring a subset of the array instead.
	`;
}

function _26(d3) {
	return d3.blur([27, 0, 0, 0, undefined, 0, 0, 0, 0, 0, 27], 1);
}

function _27(d3) {
	return d3.blur(
		[27, 0, 0, 0, undefined, 0, 0, 0, 0, 0, 27].map((d) => (isFinite((d = +d)) ? d : 0)),
		1
	);
}

function _28(md) {
	return md`
D3 can also blur a color image, see [d3.blurImage](/@d3/d3-blurimage).
	`;
}

export default function define(runtime, observer) {
	const main = runtime.module();
	main.variable(observer()).define(['md'], _1);
	main.variable(observer()).define(['md'], _2);
	main.variable(observer('randomWalk')).define('randomWalk', ['d3'], _randomWalk);
	main.variable(observer('blurredWalk')).define('blurredWalk', ['d3', 'randomWalk'], _blurredWalk);
	main.variable(observer('chart')).define('chart', ['Plot', 'randomWalk', 'blurredWalk'], _chart);
	main.variable(observer()).define(['md'], _6);
	main.variable(observer()).define(['md'], _7);
	main.variable(observer()).define(['d3', 'r', 'Plot'], _8);
	main.variable(observer('viewof r')).define('viewof r', ['Inputs'], _r);
	main.variable(observer('r')).define('r', ['Generators', 'viewof r'], (G, _) => G.input(_));
	main.variable(observer()).define(['tex', 'md'], _10);
	main.variable(observer()).define(['d3', 'Plot', 'r'], _11);
	main.variable(observer()).define(['tex', 'md'], _12);
	main.variable(observer()).define(['md'], _13);
	main.variable(observer()).define(['d3'], _14);
	main.variable(observer()).define(['md'], _15);
	main.variable(observer()).define(['Plot', 'd3', 'r2'], _16);
	main.variable(observer('viewof r2')).define('viewof r2', ['Inputs'], _r2);
	main.variable(observer('r2')).define('r2', ['Generators', 'viewof r2'], (G, _) => G.input(_));
	main.variable(observer()).define(['md'], _18);
	main.variable(observer()).define(['md'], _19);
	main.variable(observer()).define(['md'], _20);
	main.variable(observer('pixels')).define('pixels', _pixels);
	main.variable(observer('blurred')).define('blurred', ['d3', 'pixels'], _blurred);
	main.variable(observer()).define(['htl', 'Plot', 'pixels', 'blurred'], _23);
	main.variable(observer()).define(['md'], _24);
	main.variable(observer()).define(['md'], _25);
	main.variable(observer()).define(['d3'], _26);
	main.variable(observer()).define(['d3'], _27);
	main.variable(observer()).define(['md'], _28);
	return main;
}
