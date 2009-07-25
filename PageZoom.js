/*
Script: MooEditable.js
	Class to zoom in anything in a page.

License:
	MIT-style license.

Copyright:
	Copyright (c) 2007-2009 [Lim Chee Aun](http://cheeaun.com).
*/

var PageZoom = new Class({
	
	Implements: [Options],
	
	options: {
		scale: 4,
		width: 300,
		height: 300
	},
	
	initialize: function(options){
		this.setOptions(options);
		this.render();
	},
	
	render: function(){
		var self = this;
		var scale = self.options.scale;
		
		var container = this.container = new Element('div', {
			styles: {
				position: 'absolute',
				left: '-100%',
				top: '-100%',
				width: this.options.width,
				height: this.options.height,
				'border-radius': '10px',
				'-moz-border-radius': '10px',
				'-webkit-border-radius': '10px',
				padding: 10,
				backgroundColor: (Browser.Engine.trident) ? '#aaa' : 'rgba(0,0,0,0.5)' // IE complains about some invalid value.
			}
		});
		
		this.crosshair = new Element('div', {
			styles: {
				width: '1em',
				height: '1em',
				position: 'absolute',
				left: '50%',
				top: '50%',
				margin: '-.5em 0 0 -.5em',
				fontFamily: 'monospace',
				fontSize: 20,
				textAlign: 'center',
				verticalAlign: '1em',
				color: '#000',
				'text-shadow': '0 0 2px #fff',
				'-moz-text-shadow': '0 0 2px #fff',
				'-webkit-text-shadow': '0 0 2px #fff'
			},
			text: '+'
		});
		
		this.iframe = new IFrame({
			src: document.location.href + '?', // Question mark character, so that page appears in iframe.
			styles: {
				width: '100%',
				height: '100%',
				border: 0,
				backgroundColor: '#fff'
			},
			frameBorder: 0,
			events: {
				load: function(){
					var win = this.contentWindow;
					var body = (Browser.Engine.trident) ? $(win.document.body) : $(win.document.html);
					var margins = {
						x: self.options.width/2/(scale-1),
						y: self.options.height/2/(scale-1)
					};
					var windowSize = window.getScrollSize();
					var ifrSize = container.getSize();
					
					body.setStyles({
						width: windowSize.x * ((Browser.Engine.gecko) ? 1 : scale),
						height: (Browser.Engine.gecko) ? '' : windowSize.y * scale,
						overflow: 'hidden'
					});
					
					if (Browser.Engine.trident){
						body.setStyles({
							zoom: scale,
							// Below is the IEWTF code.
							position: 'absolute',
							top: self.options.width/2/scale,
							left: self.options.height/2/scale,
							padding: body.getStyle('padding').split(' ').map(function(p){
								// IE re-zooms in the zoomed paddings of the <body> element
								// 2px padding -> 200% zoom = 8px, NOT 4px!
								var val = p.toFloat();
								return p.replace(val, val/scale);
							}).join(' ')
						});
					} else {
						var origin = '-' + margins.x + 'px -' + margins.y + 'px';
						body.setStyles({
							'transform-origin': origin,
							'transform': 'scale(' + scale + ',' + scale +')',
							'-moz-transform-origin': origin,
							'-moz-transform': 'scale(' + scale + ',' + scale +')',
							'-webkit-transform-origin': origin,
							'-webkit-transform': 'scale(' + scale + ',' + scale +')',
							'padding-right': margins.x + body.getStyle('padding-right').toInt(),
							'padding-bottom': margins.y + body.getStyle('padding-bottom').toInt()
						});
					}
					
					window.addEvent('resize', function(){
						windowSize = window.getScrollSize();
						body.setStyles({
							width: windowSize.x * ((Browser.Engine.gecko) ? 1 : scale),
							height: (Browser.Engine.gecko) ? '' : windowSize.y * scale
						});
					});
					
					// IE freaks out when trying to 'unload'
					if (Browser.Engine.trident) window.addEvent('unload', self.detach.bind(self));
					
					document.addEvent('mousemove', function(e){
						var pos = e.page;
						var position = {
							left: pos.x + 30,
							top: pos.y + 30
						}
						if (pos.x > (windowSize.x-ifrSize.x-40)) position.left = pos.x-ifrSize.x-30;
						if (pos.y > (windowSize.y-ifrSize.y-40)) position.top = pos.y-ifrSize.y-30;
						container.setStyles(position);
						win.scrollTo(scale * (pos.x), scale * (pos.y));
					});
					
					body.addEvents({
						mouseenter: function(){
							// Some tricks to make sure there's no chance for cursor to hover over the preview, in Firefox
							self.container.setStyles({
								left: '-100%',
								top: '-100%'
							});
						},
						mousedown: function(e){
							e.stop();
						},
						click: function(e){
							e.stop();
						}
					});
				}
			}
		});
	},
	
	attach: function(){
		this.container.adopt(this.iframe, this.crosshair).inject(document.body);
		return this;
	},
	
	detach: function(){
		this.container.dispose();
		return this;
	}
	
});