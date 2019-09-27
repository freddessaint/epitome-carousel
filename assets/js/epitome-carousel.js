/**
 * Epitome Carousel v1.0
 * 
 * Authored by Fred Dessaint
 * www.freddessaint.com
 * @freddessaint
 *
 * Copyright 2014, Fred Dessaint
 * License: GNU General Public License, version 3 (GPL-3.0)
 * http://www.opensource.org/licenses/gpl-3.0.html
 */

(function(global, factory) {
	'use strict';
	if (typeof define == 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	}
	else {
		// Global
		var $ = global.jQuery;
		factory($);
	}

})(window, function($) {
	'use strict';

	var EpitomeCarousel = window.EpitomeCarousel || {};

	/**
	 * EpitomeCarousel - About info.
	 *
	 * @param	Objet options - A set of options, see vars below.
	 *
	 * @var 	jQuery Object element - The target element (optional).
	 *
	 * @return	jQuery plugin.
	 */
	EpitomeCarousel = (function() {
		var instanceID = 0;

		function EpitomeCarousel(element, options) {
			var self = this;

			/**
			 * To save a JSON in HTML data attribute, Stringy JSON object
			 * and encode it with encodeURIComponent() method.
			 *
			 * @see Store JSON object in data attribute in HTML jQuery
			 * @link https://stackoverflow.com/questions/8542746/store-json-object-in-data-attribute-in-html-jquery
			 *
			 * @since 1.0
			 */
			var dataEncoded = getData($(element).data('epitome-carousel'), '')
			var dataOptions = safeJSONParse(decodeURIComponent(dataEncoded), [
					'slidePause',
					'pauseOnHover',
					'slideSpeed',
					'arrowsNav',
					'dotsNav',
					'timerNav',
					'cssEase',
					'arrowsStyleClass',
					'dotsStyleClass'
				], 500) || {};

			self.instanceID = ++instanceID;
			self.settings = $.extend({
				slidePause: 3000,
				pauseOnHover: true,
				startItem: 1,
				width: 'auto',
				height: 'auto',
				maxHeight: 360,
				heightRatio: 0.5625,
				slideSpeed: 600,
				wheelPause: 600,
				slideShow: 1,
				slideScroll: 1,
				prefetch: true,
				sitOnTop: false,
				prevText: "Prev",
				nextText: "Next",
				arrowsNav: true,
				dotsNav: true,
				timerNav: true,
				keyNav: false,
				wheelNav: false,
				controlEntityMarkup: '<div class="carousel-controls"></div>',
				arrowEntityMarkup: '<div class="carousel-control-arrows {class}"></div>',
				arrowPreviousMarkup: '<div class="carousel-arrow carousel-arrow-prev"></div>',
				arrowNextMarkup: '<div class="carousel-arrow carousel-arrow-next"></div>',
				angleUpMarkup:
					'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="17" height="17" viewBox="0 0 17 17">' +
					'<path d="M16.354 11.896l-0.707 0.707-7.147-7.146-7.146 7.146-0.707-0.707 7.853-7.853 7.854 7.853z" fill="#000000" />' +
					'</svg>',
				angleRightMarkup:
					'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="17" height="17" viewBox="0 0 17 17">' +
					'<path d="M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z" fill="#000000" />' +
					'</svg>',
				angleDownMarkup:
					'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="17" height="17" viewBox="0 0 17 17">' +
					'<path d="M16.354 5.075l-7.855 7.854-7.853-7.854 0.707-0.707 7.145 7.146 7.148-7.147 0.708 0.708z" fill="#000000" />' +
					'</svg>',
				angleLeftMarkup:
					'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="17" height="17" viewBox="0 0 17 17">' +
					'<path d="M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z" fill="#000000" />' +
					'</svg>',
				paddlePreviousMarkup: '<span aria-label="Prev" tabindex="0" role="button"></span>',
				paddleNextMarkup: '<span aria-label="Next" tabindex="0" role="button"></span>',
				dotEntityMarkup: '<div class="carousel-control-dots {class}"></div>',
				dotNavMarkup:
					'<span class="carousel-dot">' +
					'<span class="carousel-dot-inner">{index}</span>' +
					'</span>',
				timerEntityMarkup: '<div class="carousel-control-timer"></div>',
				timerIndexMarkup: '<div class="carousel-timer carousel-timer-numbers"></div>',
				timerNumberMarkup: '<span class="carousel-number is-hidden">{number}</span>',
				rowMarkup: '<div class="carousel-row"></div>',
				columnMarkup: '<div class="carousel-col"></div>',
				arrowsStyleClass: 'carousel-arrows-basic',
				dotsStyleClass: 'carousel-dots-basic',
				cssEase: 'linear', // Or a function like 'cubic-bezier(0.7, 0, 0.3, 1)'.
				verticalMode: false,
				breakpoints: Array(),
				prevHandle: null,
				nextHandle: null,
				itemHandle: null,
				transitionHandle: transitionBasic,
				beforeChange: null,
				afterChange: null,
				updateHeight: null,
				resize: null
			}, options, dataOptions);
			self.elements = {
				container: {
					entity: element
				},
				slide: {
					entity: null,
					items: Array(),
					itemCount: 0,
					width: self.settings.width,
					height: self.settings.height,
				},
				control: {
					entity: null
				},
				arrow: {
					isVisible: self.settings.arrowsNav,
					entity: null,
					previous: null,
					next: null,
					paddlePrevious: null,
					paddleNext: null,
					anglePrevious: null,
					angleNext: null
				},
				dot: {
					isVisible: self.settings.dotsNav,
					entity: null,
					items: Array()
				},
				timer: {
					isVisible: self.settings.timerNav,
					entity: null,
					indicator: null,
					numbers: Array()
				}
			};
			self.states = {
				formerItem: 0,
				activeItem: 0,
				carouselReady: true,
				userReady: false,
				itemDirection: 1,
				timer: 0,
				timerReady: false,
				wheelReady: true
			};
			self.handlers = {
				clickHandler: $.proxy(self.clickHandler, self),
				keyHandler: $.proxy(self.keyHandler, self),
				wheelHandler: $.proxy(self.wheelHandler, self),
				updateTransition: $.proxy(self.settings.transitionHandle, self),
				beforeChange: self.settings.beforeChange,
				afterChange: self.settings.afterChange,
				updateHeight: self.settings.updateHeight
			};
			self.methodHandlers = {
				prevSlide: self.prevSlide,
				nextSlide: self.nextSlide,
				gotoSlide: self.gotoSlide
			};
			self.navs = {
				previous: -1,
				goto: 0,
				next: 1,
				none: 0,
				up: 1,
				right: 2,
				down: 3,
				left: 4
			};

			self.init();
		}

		return EpitomeCarousel;
	}());

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.init = function() {
		var self = this;

		self.elements.slide.entity = self.elements.container.entity.children().first();
		self.elements.slide.items = self.elements.slide.entity.children();
		self.elements.slide.itemCount = self.elements.slide.items.length;

		self.setupEntity();
		self.setupArrow();
		self.setupDot();
		self.setupTimer();
		self.setupArrowEvent();
		self.setupDotEvent();

		if(self.settings.slideShow > 1) {
			self.setupMultiMode();
		}

		self.setupSize();
		self.setupEvent();

		self.states.activeItem = self.settings.startItem - 1;

		if(self.settings.startItem < 1 || self.settings.startItem > self.elements.slide.items.length) {
			self.states.activeItem = 0;
		}

		self.gotoSlide(self.states.activeItem);

		/**
		 * Init and start the timer.
		 *
		 * @since 1.0
		 */
		if(self.settings.pauseOnHover && self.settings.slidePause && self.settings.slidePause > 0) {
			self.timer('init');

			setTimeout(function () {
				self.timer('start');
			}, 250);
		}

		self.ready('carousel', true);
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.setupEntity = function() {
		var self = this;

		if(self.settings.verticalMode) {
			self.elements.container.entity.addClass('carousel-vertical');
		}
		else {
			self.elements.container.entity.addClass('carousel-horizontal');
		}
		self.elements.container.entity.attr('tabindex', '1');
		self.elements.slide.entity.addClass('carousel-items');
		self.elements.slide.items.addClass('carousel-item');
		self.elements.control.entity = $(self.settings.controlEntityMarkup).appendTo(self.elements.container.entity);
	};

	/**
	 * Arrow navigation.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.setupArrow = function() {
		var self = this;
		var value = getData(self.elements.container.entity.attr('data-epitome-arrows'), '');

		if('true' == value) {
			self.elements.arrow.isVisible = true;
		}
		else if('false' == value) {
			self.elements.arrow.isVisible = false;
		}

		if(self.elements.arrow.isVisible) {
			self.elements.arrow.entity = $(
				self.settings.arrowEntityMarkup.replace('{class}', self.settings.arrowsStyleClass)
			).appendTo(self.elements.control.entity);
			self.elements.arrow.previous = $(self.settings.arrowPreviousMarkup);
			self.elements.arrow.next = $(self.settings.arrowNextMarkup);
			self.elements.arrow.paddlePrevious = $(self.settings.paddlePreviousMarkup).appendTo(self.elements.arrow.previous);
			self.elements.arrow.paddleNext = $(self.settings.paddleNextMarkup).appendTo(self.elements.arrow.next);

			if(self.settings.verticalMode) {
				self.elements.arrow.anglePrevious = $(self.settings.angleUpMarkup).appendTo(self.elements.arrow.paddlePrevious);
				self.elements.arrow.angleNext = $(self.settings.angleDownMarkup).appendTo(self.elements.arrow.paddleNext);
			}
			else {
				self.elements.arrow.anglePrevious = $(self.settings.angleLeftMarkup).appendTo(self.elements.arrow.paddlePrevious);
				self.elements.arrow.angleNext = $(self.settings.angleRightMarkup).appendTo(self.elements.arrow.paddleNext);
			}

			$(self.elements.arrow.entity).append(self.elements.arrow.previous);
			$(self.elements.arrow.entity).append(self.elements.arrow.next);
		}
	};

	/**
	 * Dot navigation.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.setupDot = function() {
		var self = this;
		var value = getData(self.elements.container.entity.attr('data-epitome-dots'), '');

		if('true' == value) {
			self.elements.dot.isVisible = true;
		}
		else if('false' == value) {
			self.elements.dot.isVisible = false;
		}

		if(self.elements.dot.isVisible) {
			self.elements.dot.entity = $(
				self.settings.dotEntityMarkup.replace('{class}', self.settings.dotsStyleClass)
			).appendTo(self.elements.control.entity);

			self.elements.slide.items.each(function(i) {
				var itemNav = $(self.settings.dotNavMarkup.replace('{index}', (i + 1)));

				if(self.settings.itemHandle) {
					itemNav = $(self.settings.itemHandle.call(self, itemNav, i, $(self.elements.slide.items[i])));
				}

				self.elements.dot.entity.append(itemNav);
				self.elements.dot.items.push(itemNav);
			});
		}
	};

	/**
	 * Timer navigation.
	 *
	 * @see Radial Progress Meters (CSS/SVG)
	 * @link https://codepen.io/xgad/post/svg-radial-progress-meters
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.setupTimer = function() {
		var self = this;
		var value = getData(self.elements.container.entity.attr('data-epitome-timer'), '');

		if('true' == value) {
			this.elements.timer.isVisible = true;
		}
		else if('false' == value) {
			this.elements.timer.isVisible = false;
		}

		if(this.elements.timer.isVisible) {
			this.elements.timer.ring = new TimerRing();
			this.elements.timer.ring.setup(30);
			this.elements.timer.entity = $(self.settings.timerEntityMarkup).appendTo(this.elements.control.entity);
			this.elements.timer.indicator = $(
				'<svg class="carousel-timer carousel-timer-ring" ' +
					'x="0px" y="0px" ' +
					'width="' + this.elements.timer.ring.size + 'px" ' +
					'height="' + this.elements.timer.ring.size + 'px" ' +
					'viewBox="0 0 ' + this.elements.timer.ring.size + ' ' + this.elements.timer.ring.size + '" ' +
					'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
				'<circle fill="none" ' +
					'stroke-width="' + this.elements.timer.ring.strokeWidth + '" ' +
					'cx="' + this.elements.timer.ring.cxyWidth + '" ' +
					'cy="' + this.elements.timer.ring.cxyWidth + '" ' +
					'r="' + this.elements.timer.ring.radius + '">' +
				'</circle>' +
				'<circle fill="none" ' +
					'stroke-width="' + this.elements.timer.ring.strokeWidth + '" ' +
					'cx="' + this.elements.timer.ring.cxyWidth + '" ' +
					'cy="' + this.elements.timer.ring.cxyWidth + '" ' +
					'r="' + this.elements.timer.ring.radius + '" ' +
					'stroke-dasharray="' + this.elements.timer.ring.circumference + ' ' + this.elements.timer.ring.circumference + '" ' +
					'stroke-dashoffset="' + this.elements.timer.ring.offset(0) + '" ' +
					'transform="rotate(-90 ' + this.elements.timer.ring.cxyWidth + ' ' + this.elements.timer.ring.cxyWidth + ')">' +
				'</circle>' +
				'</svg>'
			).appendTo(this.elements.timer.entity);
			this.elements.timer.index = $(self.settings.timerIndexMarkup).appendTo(this.elements.timer.entity);
			this.elements.slide.items.each(function(i) {
				self.elements.timer.numbers[i] = $(self.settings.timerNumberMarkup.replace('{number}', (i + 1))).appendTo(self.elements.timer.index);
			});
		}
	};

	/**
	 * Click on a direction button.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.setupArrowEvent = function() {
		var self = this;

		if(self.elements.arrow.isVisible) {
			self.elements.arrow.paddlePrevious
				.off('click.epitomeCarousel')
				.on('click.epitomeCarousel', {
					message: 'prev'
				}, self.handlers.clickHandler);

			self.elements.arrow.paddleNext
				.off('click.epitomeCarousel')
				.on('click.epitomeCarousel', {
					message: 'next'
				}, self.handlers.clickHandler);
		}
	};

	/**
	 * Click on a pagination dot.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.setupDotEvent = function() {
		var self = this;

		if(self.elements.dot.isVisible && self.elements.dot.items.length > 0) {
			$.each(self.elements.dot.items, function(i, element) {
				element.off('click.epitomeCarousel').on('click.epitomeCarousel', {
					message: 'goto',
					index: i
				}, self.handlers.clickHandler);
			});
		}
	};

	/**
	 * Pause carousel on hover.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.setupEvent = function() {
		var self = this;

		if(self.settings.keyNav) {
			self.elements.container.entity.on('keydown.epitomeCarousel', self.handlers.keyHandler);
		}

		/**
		 * Cross-browser wheel delta.
		 *
		 * @see mousewheel event in modern browsers
		 * @link https://stackoverflow.com/questions/14926366/mousewheel-event-in-modern-browsers
		 * @link https://developer.mozilla.org/en-US/docs/Web/Events/wheel
		 * @link https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel
		 *
		 * @since 1.0
		 */
		if(self.settings.wheelNav && self.settings.wheelPause > 0) {
			self.elements.container.entity.on('wheel.epitomeCarousel', self.handlers.wheelHandler);
		}

		/**
		 * Description.
		 *
		 * @since 1.0
		 */
		if(self.settings.pauseOnHover && self.settings.slidePause && self.settings.slidePause > 0) {
			self.elements.container.entity.hover(
				function () {
					self.timer('stop');
				},
				function () {
					self.timer('start');
				}
			);
		}
        
		/**
		 * Pause carousel when browser window is not currently active.
		 *
		 * @since 1.0
		 */
		$(window).blur(function() {
			self.timer('stop');
		});

		/**
		 * Pause carousel when outside the viewport.
		 *
		 * @since 1.0
		 */
		if(self.settings.pauseOnHover && self.settings.slidePause && self.settings.slidePause > 0) {
			 $(window).on('scroll', function() {
				if(self.states.timerReady && !self.elements.container.entity.is(':in-viewport')) {
					self.timer('stop');
				}
			});
		}

		/**
		 * Refresh values on resize.
		 *
		 * @since 1.0
		 */
		$(window).on('resize', function() {
			if(self.settings.resize) {
				var dim = self.settings.resize.call(self);
				if('auto' == dim.width) {
					dim.width = self.elements.container.entity.parent().innerWidth();
				}
				if('auto' == dim.height) {
					dim.height = Math.round(dim.width * self.settings.heightRatio);
					dim.height = (dim.height > dim.maxHeight ? dim.maxHeight : dim.height);
				}
				self.settings.width = dim.width;
				self.settings.height = dim.height;
				self.settings.maxHeight = dim.maxHeight;
				self.setupSize();
			}
		});
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.ready = function(id, value) {
		if('carousel' == id) {
			this.states.carouselReady = value;
		}
		else if('user' == id) {
			this.states.userReady = value;
		}
		else if('timer' == id) {
			this.states.timerReady = value;
		}
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.timer = function(event) {
		var self = this;

		if(self.settings.pauseOnHover && self.settings.slidePause && self.settings.slidePause > 0) {
			var element = null;

			if(self.elements.timer.isVisible) {
				element = self.elements.timer.entity.find('circle:nth-child(2)');
			}

			/**
			 * Timer Init.
			 * Initialize the indicator at the default state.
			 *
			 * @since 1.0
			 */
			if('init' == event) {
				if(self.elements.timer.isVisible) {
					element.css({
						transition: 'none'
					});
					element.attr({
						'stroke-dashoffset': self.elements.timer.ring.offset(0)
					});
				}

				self.ready('timer', true);
			}

			/**
			 * Timer Start.
			 * Launch the indicator animation during the "slidePause" variable
			 * and jump the carousel item at the next one when "slidePause"
			 * is over.
			 *
			 * @since 1.0
			 */
			else if('start' == event) {
				if(self.elements.timer.isVisible) {
					element.css({
						transition: 'stroke-dashoffset ' + self.settings.slidePause + 'ms linear'
					});
					element.attr({
						'stroke-dashoffset': self.elements.timer.ring.offset(100)
					});
				}

				clearTimeout(self.states.timer);
				self.states.timer = setTimeout(function() {
					if(self.elements.timer.isVisible) {
						element.css({
							transition: 'none'
						});
						element.attr({
							'stroke-dashoffset': self.elements.timer.ring.offset(0)
						});
					}
					self.nextSlide();
				}, self.settings.slidePause);

				self.ready('timer', true);
			}
			/**
			 * Timer Pause.
			 * Set the timer into the "pause" state.
			 *
			 * @since 1.0
			 */
			else if('pause' == event) {
				self.states.timerReady = false;
			}
			/**
			 * Timer Stop.
			 * Stop every timer activity.
			 *
			 * @since 1.0
			 */
			else if('stop' == event) {
				if(self.elements.timer.isVisible) {
					element.css({
						transition: 'none'
					});
					element.attr({
						'stroke-dashoffset': self.elements.timer.ring.offset(0)
					});
				}
				clearTimeout(self.states.timer);
				self.states.timerReady = false;
			}
			/**
			 * Timer Update.
			 * Update the timer to a new cycle if it is not
			 * into "pause" or "stop" states. Update event
			 * is commonly called after the transition between
			 * two carousel items is done.
			 *
			 * @since 1.0
			 */
			else if('update' == event) {
				if(self.states.timerReady) {
					self.timer('start');
				}
			}
		}
	};

	/**
	 * Change the carousel item to the previous one.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.prevSlide = function() {
		var self = this;

		if(self.states.carouselReady) {
			self.updateSlide(0, self.navs.previous);
		}
	};

	/**
	 * Change the carousel item to the next one.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.nextSlide = function() {
		var self = this;

		if(self.states.carouselReady) {
			self.updateSlide(0, self.navs.next);
		}
	};

	/**
	 * Change the carousel item to the specified item number.
	 *
	 * @var Integer item - The item number [1..n].
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.gotoSlide = function(item) {
		var self = this;

		if(self.states.carouselReady) {
			self.updateSlide((typeof item == 'number' ? item : parseInt(item)), self.navs.goto);
		}
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.clickHandler = function(event) {
		var self = this;
		var target = $(event.currentTarget);

		if(target.is('a')) {
			event.preventDefault();
		}

		switch (event.data.message) {
			case 'prev':
				self.prevSlide();
				break;

			case 'next':
				self.nextSlide();
				break;

			case 'goto':
				self.gotoSlide(event.data.index);
				break;
		}
	};

	/**
	 * Change the carousel item from the keyboard action.
	 * Dont slide if the cursor is inside the form fields
	 * and arrow keys are pressed.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.keyHandler = function(event) {
		var self = this;

		if(!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
			if(self.settings.verticalMode) {
				// Key up.
				if (event.keyCode === 38) {
					event.preventDefault();
					self.prevSlide();
				}
				// Key down.
				else if (event.keyCode === 40) {
					event.preventDefault();
					self.nextSlide();
				}
			}
			else {
				// Key left.
				if (event.keyCode === 37) {
					event.preventDefault();
					self.prevSlide();
				}
				// Key right.
				else if (event.keyCode === 39) {
					event.preventDefault();
					self.nextSlide();
				}
			}
		}
	};

	/**
	 * Change the carousel item from a mouse wheel action.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.wheelHandler = function(event) {
		var self = this;

		event.preventDefault();

		if(self.states.wheelReady) {
			self.states.wheelReady = false;

			setTimeout(function() {
				self.states.wheelReady = true;
			}, self.settings.wheelPause);

			var event = window.event || event;
			// var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

			if (event.deltaX > 0 || event.deltaY < 0) {
				self.nextSlide();
			}
			else if (event.deltaX < 0 || event.deltaY > 0) {
				self.prevSlide();
			};
		}
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.setupMultiMode = function() {
		var self = this;

		if(self.settings.slideShow > 1) {
			var cloneCount = self.settings.slideShow - 1;

			self.elements.slide.items.each(function() {
				var next = $(this);

				for (var i = 0 ; i < cloneCount ; i++) {
					next = next.next();

					if (next.length == 0) {
						next = $(this).siblings(':first');
					}

					next.children(':first-child').clone().appendTo($(this));
				}
			});

			if(self.settings.rowMarkup.length > 0 && self.settings.columnMarkup.length > 0) {
				self.elements.slide.items.each(function() {
					var children = $(this).children();
					var dest = $(self.settings.rowMarkup).appendTo($(this));

					children.detach().appendTo(dest).wrap(self.settings.columnMarkup);
				});				
			}
		}
	};

	/**
	 * Add a width class [is-small|is-medium|is-large] on an element depending
	 * on the minimum width of that element.
	 * The array must have 3 entries, for small, medium and large widths.
	 *
	 * @var jQuery element - The element to apply the class.
	 * @var Array breakpoints - Three min-widths that act as element queries.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.updateElementBreakpoint = function(element, breakpoints) {
		var self = this;

		if(breakpoints.length > 0 && breakpoints.length <= 3) {
			var elementWidth = element.parent().innerWidth();
			var classes = Array('is-small', 'is-medium', 'is-large');
			var foundBreakpoint = false;

			for(var i = breakpoints.length - 1 ; i >= 0 ; i--) {
				if(!foundBreakpoint && elementWidth >= breakpoints[i]) {
					foundBreakpoint = true;
					element.addClass(classes[i]);
				}
				else {
					element.removeClass(classes[i]);
				}
			}
		}
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.setupSize = function() {
		var self = this;
		var width = self.elements.slide.width;
		var height = self.elements.slide.height;

		if('auto' == width) {
			width = self.elements.container.entity.parent().innerWidth();
		}
		if('auto' == height) {
			var format = self.elements.container.entity.closest('[data-epitome-format]');

			if(format.length > 0) {
				height = format.height();
			}
			else {
				height = Math.round(width * self.settings.heightRatio);
			}

			height = (height > self.settings.maxHeight ? self.settings.maxHeight : height);
		}

		self.updateElementBreakpoint(self.elements.container.entity, self.settings.breakpoints);
	};

	/**
	 * Actions before the transition.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.beforeTransition = function() {
		var self = this;

		$(self.elements.slide.items[self.states.formerItem]).removeAttr('aria-live');
		$(self.elements.slide.items[self.states.activeItem]).attr('aria-live', 'polite');

		// .carousel-item.is-active
		$(self.elements.slide.items[self.states.formerItem]).removeClass('is-current').addClass('is-active');

		// .carousel-item.is-current
		$(self.elements.slide.items[self.states.activeItem]).removeClass('is-active').addClass('is-current');
	};

	/**
	 * Actions after the transition.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.afterTransition = function() {
		var self = this;

		// .carousel-item
		$(self.elements.slide.items[self.states.formerItem]).removeClass('is-current').removeClass('is-active');
		$(self.elements.slide.items[self.states.formerItem]).css({
			transition: '',
			transform: 'none'
		});

		// .carousel-item.is-active.is-current
		$(self.elements.slide.items[self.states.activeItem]).addClass('is-active').addClass('is-current');
		$(self.elements.slide.items[self.states.activeItem]).css({
			transition: '',
			transform: 'none'
		});

		self.ready('carousel', true);
		self.timer('update');
	};

	/**
	 * Launch the transition through a dedicated callback function.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.updateTransition = function() {
		var self = this;

		/**
		 * Call the registered transition.
		 *
		 * @since 1.0
		 */
		if(self.states.itemDirection != self.navs.none) {
			self.beforeTransition();

			/**
			 * Callback transitionHandle.
			 * User function for processing things *during* the carousel change.
			 *
			 * @var jQuery formerElement - Element to the previous active item.
			 * @var jQuery activeElement - Element to the next active item.
			 * @var Integer direction - The direction of the slides.
			 *
			 * @since 1.0
			 */
			self.handlers.updateTransition(
				$(self.elements.slide.items[self.states.formerItem]),
				$(self.elements.slide.items[self.states.activeItem]),
				self.states.itemDirection
			);

			setTimeout(function() {
				self.afterTransition();
			}, self.settings.slideSpeed);
		}

		/**
		 * No transition needed because the target is already set.
		 * Just set target elements with the right styles through
		 * functions beforeTransition() and afterTransition().
		 *
		 * @since 1.0
		 */
		else {
			self.beforeTransition();
			self.afterTransition();
		}
	};

	/**
	 * Evaluate the user direction after the click on a carousel button
	 * (previous, goto, next) and return the effective direction (previous, next)
	 * especially when user click on a dot (goto).
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.evaluateDirection = function(direction, item) {
		var self = this;

		/**
		 * Validate the user direction (previous, goto, next).
		 *
		 * @since 1.0
		 */
		var userDirection = (
			direction == self.navs.previous ||
			direction == self.navs.goto ||
			direction == self.navs.next ?
			direction : 1
		);
		var calcDirection;

		/**
		 * Transition to the previous slide.
		 *
		 * @since 1.0
		 */
		if(userDirection == self.navs.previous) {
			calcDirection = userDirection;
		}

		/**
		 * Transition to the goto slide.
		 *
		 * @since 1.0
		 */
		else if(userDirection == self.navs.goto) {
			var activeItem;

			/**
			 * Validate what should be the new active item.
			 *
			 * @since 1.0
			 */
			activeItem = item;
			activeItem = (activeItem < 0 ? 0 : activeItem);
			activeItem = (activeItem > (self.elements.slide.itemCount - 1) ? self.elements.slide.itemCount - 1 : activeItem);

			/**
			 * Transition to the previous slide.
			 *
			 * @since 1.0
			 */
			if(activeItem < self.states.activeItem) {
				calcDirection = self.navs.previous;
			}

			/**
			 * Transition to the next slide.
			 *
			 * @since 1.0
			 */
			else if(activeItem > self.states.activeItem) {
				calcDirection = self.navs.next;
			}

			/**
			 * No transition needed because the target is already set,
			 * just call after() function.
			 *
			 * @since 1.0
			 */
			else {
				calcDirection = self.navs.none;
			}
		}

		/**
		 * Transition to the next slide.
		 *
		 * @since 1.0
		 */
		else if(userDirection == self.navs.next) {
			calcDirection = userDirection;
		}

		/**
		 * No transition needed because the target is already set.
		 *
		 * @since 1.0
		 */
		else {
			calcDirection = self.navs.none;
		}

		return calcDirection;
	};

	/**
	 * Calculate the visual item direction (left, right) for horizontal mode
	 * or (top, bottom) for vertical mode depending on the triggered action.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.updateDirection = function(direction) {
		var self = this;

		/**
		 * Transition to the previous slide.
		 *
		 * @since 1.0
		 */
		if(direction == self.navs.previous) {
			if(self.settings.verticalMode) {
				self.states.itemDirection = self.navs.up;
			}
			else {
				self.states.itemDirection = self.navs.left;
			}			
		}
		/**
		 * Transition to the next slide.
		 *
		 * @since 1.0
		 */
		else if(direction == self.navs.next) {
			if(self.settings.verticalMode) {
				self.states.itemDirection = self.navs.down;
			}
			else {
				self.states.itemDirection = self.navs.right;
			}
		}
		/**
		 * No transition needed because the target is already set.
		 *
		 * @since 1.0
		 */
		else {
			self.states.itemDirection = self.navs.none;
		}
	};

	/**
	 * Evaluate which item will be the next active item
	 * regarless the user direction.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.evaluateItem = function(item, direction) {
		var self = this;
		var activeItem = self.states.activeItem;

		if(direction == self.navs.previous) {
			activeItem = (activeItem > 0 ? activeItem - 1 : self.elements.slide.itemCount - 1);
		}
		else if(direction == self.navs.goto) {
			activeItem = item;
			activeItem = (activeItem < 0 ? 0 : activeItem);
			activeItem = (activeItem > (self.elements.slide.itemCount - 1) ? self.elements.slide.itemCount - 1 : activeItem);
		}
		else if(direction == self.navs.next) {
			activeItem = (activeItem < (self.elements.slide.itemCount - 1) ? activeItem + 1 : 0);
		}

		return activeItem;
	};

	/**
	 * Update active and former items.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.updateItem = function(item) {
		var self = this;

		self.states.formerItem = self.states.activeItem;
		self.states.activeItem = item;
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.updateSlide = function(item, direction) {
		var self = this;

		self.ready('carousel', false);

		var userDirection = self.evaluateDirection(direction, item);
		var activeItem = self.evaluateItem(item, direction);

		self.updateDirection(userDirection);

		/**
		 * Callback beforeChange.
		 * User function for processing things *before* the carousel changes the slide.
		 *
		 * @var Integer formerItem - The previous active item.
		 * @var Integer activeItem - The next active item.
		 * @var Integer itemDirection - The item direction (up, right, down, left).
		 *
		 * @since 1.0
		 */
		if(self.handlers.beforeChange) {
			self.handlers.beforeChange.call(self, self.states.activeItem, activeItem, self.states.itemDirection);
		}

		self.updateItem(activeItem);

		loadImage($(self.elements.slide.items[self.states.activeItem]).find('img[data-src]'));

		/**
		 * Callback updateHeight.
		 * User function allowing to modify the carousel height when various
		 * slides have different heights. The user can use an animate feature
		 * for a smooth render.
		 * Called only when settings options "slideShow" is "1"
		 * and option "verticalMode" is false.
		 *
		 * @var jQuery element - Element to modify the height.
		 * @var Integer height - The height to apply on the element.
		 *
		 * @since 1.0
		 */
		if(self.settings.updateHeight &&
			self.settings.slideShow === 1 &&
			self.settings.verticalMode === false) {
			
			var height = $(self.elements.slide.items[self.states.activeItem]).outerHeight(true);

			if(height > 0) {
				self.settings.updateHeight.call(self, self.elements.slide.entity, height);
			}
		}

		self.updateTransition();
		self.updatePagination();
		self.updateBrightness();
		self.updateTimerNumber();

		/**
		 * Callback afterChange.
		 * User function for processing things *after* the carousel has changed slide.
		 *
		 * @var Integer activeItem - The current active item.
		 * @var Integer itemDirection - The item direction (up, right, down, left).
		 *
		 * @since 1.0
		 */
		if(self.handlers.afterChange) {
			setTimeout(function() {
				self.handlers.afterChange.call(self, self.states.activeItem, self.states.itemDirection);
			}, self.settings.slideSpeed);
		}			

		/**
		 * Move the carousel to the top of the window.
		 *
		 * @since 1.0
		 */
		if(self.settings.sitOnTop && self.states.userReady) {
			var elementTop = $(window).scrollTop();
			$('html, body').animate({
				scrollTop: elementTop + (self.elements.slide.entity.offset().top - elementTop)
			}, 500, 'linear');
		}

		/**
		 * Prefetch images.
		 *
		 * @since 1.0
		 */
		if(self.settings.prefetch) {
			var prevItem = (self.states.activeItem > 0 ? self.states.activeItem - 1 : self.elements.slide.itemCount - 1);
			var nextItem = (self.states.activeItem < (self.elements.slide.itemCount - 1) ? self.states.activeItem + 1 : 0);

			loadImage($(self.elements.slide.items[prevItem]).find('img[data-src]'));
			loadImage($(self.elements.slide.items[nextItem]).find('img[data-src]'));
		}
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.updatePagination = function() {
		var self = this;

		if(self.elements.dot.isVisible) {
			var container = self.elements.dot.entity;
			$('.carousel-dot', container).removeClass('is-active');
			$($('.carousel-dot', container).get(self.states.activeItem)).addClass('is-active');
		}  
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.updateBrightness = function() {
		var self = this;

		if(self.elements.arrow.isVisible || self.elements.dot.isVisible) {
			var element = $(self.elements.slide.items[self.states.activeItem]);
			var brightness = getData(element.attr('data-epitome-brightness'), '');
		}

		self.elements.control.entity.removeClass('style-color-dark').removeClass('style-color-light');

		if('dark' == brightness) {
			self.elements.control.entity.addClass('style-color-dark');
		}

		if('light' == brightness) {
			self.elements.control.entity.addClass('style-color-light');
		}
	};

	/**
	 * Get the carousel instance attached to an element.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.getCarousel = function() {
		return this;
	};

	/**
	 * Get the carousel instance attached to an element.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.getSlideCount = function() {
		return this.elements.slide.items.length;
	};

	/**
	 * Update the number of current carousel item inside the timer ring.
	 *
	 * @since 1.0
	 */
	EpitomeCarousel.prototype.updateTimerNumber = function() {
		if(this.elements.timer.isVisible) {
			var former = this.elements.timer.numbers[this.states.formerItem];
			var active = this.elements.timer.numbers[this.states.activeItem];

			if(former.length > 0 && active.length > 0) {
				former.removeClass('is-visible').addClass('is-hidden');
				active.removeClass('is-hidden').addClass('is-visible');						
			}
		}
	};

	$.fn.EpitomeCarousel = function() {
		var self = this,
			scope = arguments[0],
			args = Array.prototype.slice.call(arguments, 1),
			returnValue;

		$(self).each(function(i) {
			if (typeof scope == 'object' || typeof scope == 'undefined') {
				self[i].instance = new EpitomeCarousel($(this), scope);
				returnValue = self;
			}
			else {
				if(self[i].instance.methodHandlers.hasOwnProperty(scope)) {
					returnValue = self[i].instance.methodHandlers[scope].apply(self[i].instance, args);
				}
				else {
					throw new Error("User callback does not exists: " + scope);
				}
			}

			if (typeof returnValue != 'undefined') {
				return returnValue;
			}
		});

		return returnValue;
	};

	/**
	 * Get data from an attibute if it exists or a default value if not exists.
	 *
	 * @since 1.0
	 */
	var getData = function(attr, defaultValue) {
		return ((typeof attr !== typeof undefined && attr !== false) ? attr : defaultValue);
	};

	/**
	 * A parsing function that expects an object with properties that applies
	 * some of these checks and gives you a filtered result that only contains
	 * the properties you were expecting.
	 *
	 * @see Is sanitizing JSON necessary?
	 * @link https://stackoverflow.com/questions/25983090/is-sanitizing-json-necessary
	 *
	 * @var Sting str - JSON encoded input string.
	 * @var Array propArray - The properties you were expecting only.
	 * @var Integer maxLen - Sanitize the length of data.
	 *
	 *
	 * @since 1.0
	 */
	var safeJSONParse = function(str, propArray, maxLen) {
		var parsedObj, safeObj = {};

		try {
			if(!str || str.length == 0) {
				return null;
			}
			else if (maxLen && str.length > maxLen) {
				return null;
			}
			else {
				parsedObj = JSON.parse(str);

				if (typeof parsedObj !== 'object' || Array.isArray(parsedObj)) {
					safeObj = parsedObj;
				}
				else {
					propArray.forEach(function(prop) {
						if (parsedObj.hasOwnProperty(prop)) {
							safeObj[prop] = parsedObj[prop];
						}
					});
				}
				return safeObj;
			}
		} catch(e) {
			console.log('str:'+str);
			console.log('propArray:'+propArray);
			console.log('maxLen:'+maxLen);
			console.error('EpitomeCarousel.safeJSONParse:', e.message);
			return null;
		}
	};

	/**
	 * Load carousel image.
	 *
	 * @since 1.0
	 */
	var loadImage = function(imageElements) {
		if(imageElements.length > 0) {
			imageElements.each(function() {
				var img = $(this);
				var src = img.data('src');
				var image = new Image();

				image.src = src;
				image.alt = (img.is(['alt']) ? img.attr('alt') : '');
				image.onload = function() {
					img.replaceWith(image);
				};
			});
		}
	};

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	function TimerRing() {
		this.strokeWidth = 0;
		this.size = 0;
		this.cxyWidth = 0;
		this.radius = 0;
		this.circumference = 0;
	}

	/**
	 * Description.
	 *
	 * @since 1.0
	 */
	TimerRing.prototype.setup = function(size) {
		this.size = size;
		this.cxyWidth = (this.size / 2);
		this.strokeWidth = (this.size * 0.1);
		this.radius = (this.size / 2) - (this.strokeWidth / 2);
		this.circumference = 2 * Math.PI * this.radius;
	};

	TimerRing.prototype.offset = function(percent) {
		if(percent < 0 || percent > 100) {
			percent = 0;
		}

		return this.circumference * (1 - (percent / 100));
	};

	/**
	 * Process the transition through CSS (inline) and JavaScript (jQuery.animate).
	 *
	 * @var this - Points to the carousel object.
	 *
	 * @since 1.0
	 */
	var transitionBasic = function(formerElement, activeElement, direction) {
		var self = this;

		var value = (100 / self.settings.slideShow) * self.settings.slideScroll;
		var formerTransformX, activeTransformX;
		var formerTransformY, activeTransformY;

		if(direction == self.navs.up) {
			formerTransformX = '0';
			formerTransformY = value + '%';
			activeTransformX = '0';
			activeTransformY = '-' + value + '%';
		}
		else if(direction == self.navs.right) {
			formerTransformX = '-' + value + '%';
			formerTransformY = '0';
			activeTransformX = value + '%';
			activeTransformY = '0';
		}
		else if(direction == self.navs.down) {
			formerTransformX = '0';
			formerTransformY = '-' + value + '%';
			activeTransformX = '0';
			activeTransformY = value + '%';
		}
		else if(direction == self.navs.left) {
			formerTransformX = value + '%';
			formerTransformY = '0';
			activeTransformX = '-' + value + '%';
			activeTransformY = '0';
		}

		// former
		formerElement.css({
			transition: 'transform ' +  self.settings.slideSpeed + 'ms ' + self.settings.cssEase + ' 0s',
			transform: 'translateX(' + formerTransformX + ') translateY(' + formerTransformY + ')'
		});

		// active
		activeElement.css({
			transform: 'translateX(' + activeTransformX + ') translateY(' + activeTransformY + ')'
		}).show().css({
			transition: 'transform ' +  self.settings.slideSpeed + 'ms ' + self.settings.cssEase + ' 0s',
			transform: 'translateX(0) translateY(0)'
		});
	};

});
