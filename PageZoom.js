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
				backgroundColor: (Browser.Engine.trident) ? '#aaa' : 'rgba(0,0,0,0.5)'
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
			src: document.location.href + '?',
			styles: {
				width: '100%',
				height: '100%',
				border: 0,
				backgroundColor: '#fff'
			},
			events: {
				load: function(){
					var win = this.contentWindow;
					var html = $(win.document.html)
					var margins = {
						x: self.options.width/2/(self.options.scale-1),
						y: self.options.height/2/(self.options.scale-1)
					};
					var origin = '-' + margins.x + 'px -' + margins.y + 'px';
					var windowSize = window.getScrollSize();
					var ifrSize = container.getSize();
					var scale = self.options.scale;
					
					html.setStyles({
						width: windowSize.x * ((Browser.Engine.gecko) ? 1 : scale),
						overflow: 'hidden',
						'transform-origin': origin,
						'transform': 'scale(' + scale + ',' + scale +')',
						'-moz-transform-origin': origin,
						'-moz-transform': 'scale(' + scale + ',' + scale +')',
						'-webkit-transform-origin': origin,
						'-webkit-transform': 'scale(' + scale + ',' + scale +')',
						'padding-right': margins.x + html.getStyle('padding-right').toInt(),
						'padding-bottom': margins.y + html.getStyle('padding-bottom').toInt()
					});
					
					window.addEvents({
						resize: function(){
							windowSize = window.getScrollSize();
							html.setStyles('width', windowSize.x);
						},
						mousemove: function(e){
							var pos = e.page;
							var position = {
								left: pos.x + 30,
								top: pos.y + 30
							}
							if (pos.x > (windowSize.x-ifrSize.x-40)) position.left = pos.x-ifrSize.x-30;
							if (pos.y > (windowSize.y-ifrSize.y-40)) position.top = pos.y-ifrSize.y-30;
							container.setStyles(position);
							win.scrollTo(scale * (pos.x), scale * (pos.y));
						}
					});
					
					win.addEvents({
						mouseenter: function(){
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