let config =
{
	style: 'mapbox://styles/emmepra/cl55q2z7o00b814ogf7ickudo',
	accessToken:
		'pk.eyJ1IjoiZW1tZXByYSIsImEiOiJjbDU1MjdkcnoxNTBiM2RwcGdjeDdwcTdoIn0.QW7FLX0L7VgWyJVcJw2F5A',
	showMarkers: false,
	//markerColor: "#3FB1CE",
	//projection: 'equirectangular',
	//Read more about available projections here
	//https://docs.mapbox.com/mapbox-gl-js/example/projections/
	inset: true,
	theme: 'light',
	use3dTerrain: false, //set true for enabling 3D maps.
	title: 'The Title Text of this Story',
	subtitle: 'A descriptive and interesting subtitle to draw in the reader',
	byline: 'By a Digital Storyteller',
	footer:
		'Source: source citations, etc. <br> Created using <a href="https://github.com/mapbox/storytelling" target="_blank">Mapbox Storytelling</a> template.',
	chapters: [
		{
			id: 'Ukraine High',
			alignment: 'left',
			hidden: false,
			title: 'Display Title',
			image: './path/to/image/source.png',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			location: {
				center: [31.18128, 48.50787],
				zoom: 4.5,
				pitch: 45.0,
				bearing: 0.0
			},
			mapAnimation: 'flyTo',
			rotateAnimation: false,
			callback: '',
			onChapterEnter: [],
			onChapterExit: [
				{
					layer: 'ukraine-area',
					opacity: 0.35
				}
			]
		},
		{
			id: 'Ukraine Zoom',
			alignment: 'right',
			hidden: false,
			title: 'Display Title 22',
			image: './path/to/image/source.png',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			location: {
				center: [31.18128, 48.50787],
				zoom: 5.5,
				pitch: 45.0,
				bearing: 0.0
			},
			mapAnimation: 'flyTo',
			rotateAnimation: false,
			callback: '',
			onChapterEnter: [],
			onChapterExit: []
		},
		{
			id: 'Odessa Port',
			alignment: 'right',
			hidden: false,
			title: 'Second Title',
			image: './path/to/image/source.png',
			description: 'Copy these sections to add to your story.',
			location: {
				center: [30.7413, 46.49842],
				zoom: 13.28,
				pitch: 45.0,
				bearing: 0.0
				// flyTo additional controls-
				// These options control the flight curve, making it move
				// slowly and zoom out almost completely before starting
				// to pan.
				//speed: 2, // make the flying slow
				//curve: 1, // change the speed at which it zooms out
			},
			mapAnimation: 'flyTo',
			rotateAnimation: true,
			callback: '',
			onChapterEnter: [
				{
					layer: 'ukraine-area',
					opacity: 0
				}
			],
			onChapterExit: []
		},
		{
			id: 'Middle East',
			alignment: 'left',
			hidden: false,
			title: 'Third Title',
			image: './path/to/image/source.png',
			description: 'Copy these sections to add to your story.',
			location: {
				center: [39.79726, 27.81408],
				zoom: 4.0,
				pitch: 45.0,
				bearing: 0.0
			},
			mapAnimation: 'flyTo',
			rotateAnimation: false,
			callback: '',
			onChapterEnter: [
				{
					layer: 'ukraine-area',
					opacity: 0
				},
				{
					layer: 'me-area',
					opacity: 0.35
				}
			],
			onChapterExit: [
				{
					layer: 'me-area',
					opacity: 0
				}
			]
		},
		{
			id: 'fourth-chapter',
			alignment: 'fully',
			hidden: false,
			title: 'Third Title',
			image: './path/to/image/source.png',
			description: 'Copy these sections to add to your story.',
			location: {
				center: [31.2544, 30.06598],
				zoom: 12.67,
				pitch: 45.0,
				bearing: 0.0
			},
			mapAnimation: 'flyTo',
			rotateAnimation: false,
			callback: '',
			onChapterEnter: [
				{
					layer: 'egypt-area',
					opacity: 0.35
				}
			],
			onChapterExit: []
		}
	]
};
