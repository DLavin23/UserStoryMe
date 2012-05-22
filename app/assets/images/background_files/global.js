var _domIsLoaded = false, _j = 0, _angle = 0, _width = 0, _height = 0, _paletteIsCPW = false, _timeOut = 0;
var _currentPage = "", _timeout = {}, _cookieDomain = location.hostname.toLowerCase().match(/^[^.]+(.+)/)[1];
var _monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

var _cl_timeouts = {_checkForUserNameAvailability: 0,_hideAllNavItems :0,_autoGrowingRow: 0}, _lastUserNameChecked = "", _currentPosition = 0, _originalValues = {};

/*
// This should work in IE, Firefox and Chrome.
window.onerror = function() {
	$$("input.javascript-errors").each(function(_element) {
		_element.value += (Object.toJSON(this) + "\n");
	}.bind(arguments));

	return false; // Pass error to browser
};

// Bring Opera up to speed... -- http://stackoverflow.com/questions/645840/mimic-window-onerror-in-opera-using-javascript/6342356#6342356
if (window.opera !== undefined) {
	(function () {
		var _oldToString = Error.prototype.toString;

		Error.prototype.toString = function () {
			var _msg = "";

			try {
				_msg = _oldToString.apply(this,arguments);
				window.onerror(_msg,(typeof (this) === "object") ? this.stack : "","");
			} catch (e) {}

			return _msg;
		};
	}());
}
*/

jQuery.noConflict()(function($) {
	$('a[rel=tipsy]').tipsy({live: true, html: true, gravity: 's'});
});

Event.observe(window,"resize",function(_event) {
	positionLogInDropDown();
});

function intval(n,radix) {
	n = parseInt(n,radix || 10);
	return isNaN(n) ? 0 : n;
}

function floatval(n) {
	n = parseFloat(n);
	return isNaN(n) ? 0.0 : n;
}
function positionLogInDropDown() {
	if (($("log-in-drop-down") !== null) && ($("log-in-drop-down").className === "selected")) {
		$("log-in-drop-down-contents").style.visibility	= "hidden";
		$("log-in-drop-down-contents").style.display	= "block";

		var position			= $("log-in-drop-down").cumulativeOffset();
		var logInBtnDimmensions	= $("log-in-drop-down").getDimensions();
		var logInDivWidth		= $("log-in-drop-down-contents").getWidth();

		$("log-in-drop-down-contents").style.left		= ((position.left - logInDivWidth + logInBtnDimmensions.width).toString() + "px");
		$("log-in-drop-down-contents").style.top		= ((position.top + logInBtnDimmensions.height - 1).toString() + "px"); // - 1 to hide it under the btn
		$("log-in-drop-down-contents").style.visibility	= "visible";
	}
}

function loadLogInDropDownContents() {
	window.headerLogInFormExists = true;

	$("log-in-drop-down-contents").update('<iframe src="https://' + location.hostname + '/ajax/header-log-in-form?r=' + encodeURIComponent(location.href) + '" frameborder="0" height="110" width="270" marginheight="0" marginwidth="0" scrolling="no" auto="no" style="background-color: #ffffff;"></iframe>');
}

document.observe("dom:loaded",function(_event) {
	var _body = document.getElementsByTagName("body")[0];
	_body.appendChild(Builder.node("div",{id: "cl-overlay-content",className: "cl-overlay-content",style: "display: none;"}));
	_body.appendChild(Builder.node("div",{id: "cl-overlay",className: "cl-overlay",style: "display: none;"}));
	$("cl-overlay").setOpacity(0.8);

	/* Label Overlay */
	$$('div.label-overlay label').each(function(label) {
		label.observe('click', function() {
			this.hide();
		}.bind(label));
	});
	$$('div.label-overlay input').each(function(input) {
		input.observe('focus', function() {
			this.previous('label').hide();
		}.bind(input));
		input.observe('blur', function() {
			if (this.value === '') {
				this.previous('label').show();
			}
		}.bind(input));
		if (input.value !== '') {
			input.previous('label').hide();
		} else {
			input.previous('label').show();
		}
	});

	/* Log In Drop Down */
	if ($("log-in-drop-down") !== null) {
		Event.observe("log-in-drop-down","mouseenter",function(_event) {
			if (window.headerLogInFormExists !== true) {
				loadLogInDropDownContents();
			}
		});

		Event.observe("log-in-drop-down","click",function(_event) {
			if (window.headerLogInFormExists !== true) {
				loadLogInDropDownContents();
			}

			if ($("log-in-drop-down").className === "selected") {
				showObtrusiveElements();

				$("log-in-drop-down").className					= "";
				$("log-in-drop-down-contents").style.display	= "none";
			} else {
				hideObtrusiveElements();

				$("log-in-drop-down").className = "selected";
				positionLogInDropDown();
			}
		});
	}

	/* Account Drop Down */
	if ($("account-drop-down") !== null) {
		Event.observe("account-drop-down","mouseover",function(_event) {
			$("account-drop-down-contents").style.visibility	= "visible";
			$("account-drop-down-contents").style.height		= "auto";
		});
		Event.observe("account-drop-down","mouseout",function(_event) {
			$("account-drop-down-contents").style.visibility	= "hidden";
			$("account-drop-down-contents").style.height		= "0";
		});
	}

	/* Online Users */
	if ($('online-users-pop-up') !== null) {
		var onlineUsersScrollBar = new Control.ScrollBar('online-users-scroll-content', 'online-users-scroll-track');
		var OnlineUsersPopUp = new Class.create({
			initialize: function() {
				this.timeout = 0;

				if ($("online-users-pop-up") !== null) {
					Event.observe(window, "resize", function(_event) {
						this.resetPosition();
					}.bind(this));
					$("online-users-pop-up").observe("mouseover", function() {
						this.show();
					}.bind(this));
					$("online-users-pop-up").observe("mouseout",function() {
						this.delayHide();
					}.bind(this));
					if ($("online-users-trigger") !== null) {
						this.resetPosition();
						$("online-users-trigger").observe("mouseover", function() {
							this.show();
						}.bind(this));
						$("online-users-trigger").observe("mouseout", function() {
							this.delayHide();
						}.bind(this));
					}
					if ($("hide-online-users-pop-up") !== null) {
						$("hide-online-users-pop-up").observe("click", function(e) {
							e.stop();
						}.bind(this));
					}
				}
			},
			hide: function() {
				$("online-users-pop-up").hide();
				$("online-users-trigger").removeClassName('hover');
			},
			delayHide: function() {
				this.timeout = this.hide.delay(0.1);
			},
			show: function() {
				onlineUsersScrollBar.recalculateLayout();
				clearTimeout(this.timeout);
				$("online-users-trigger").addClassName('hover');
				$("online-users-pop-up").show();
			},
			resetPosition: function() {
				$("online-users-pop-up").clonePosition($("online-users-trigger"), {
					setTop:		false,
					setWidth:	false,
					setHeight:	false,
					offsetLeft:	$("online-users-trigger").getWidth() / 2 - $("online-users-pop-up").getWidth() / 2 + 1
				});
			}
		});
		window.OnlineUsersPopUp = new OnlineUsersPopUp();
	}

	/* Tour Pop Up */
	var TourPopUp = new Class.create({
		initialize: function() {
			this.timeout = 0;

			if ($("tour-pop-up") !== null) {
				Event.observe(window, "resize", function(_event) {
					this.resetPosition();
				}.bind(this));
				$("tour-pop-up").observe("mouseover", function() {
					this.show();
				}.bind(this));
				$("tour-pop-up").observe("mouseout",function() {
					this.delayHide();
				}.bind(this));
				if ($("tour-btn") !== null) {
					this.resetPosition();
					$("tour-btn").observe("mouseover", function() {
						this.show();
					}.bind(this));
					$("tour-btn").observe("mouseout", function() {
						this.delayHide();
					}.bind(this));
				}
				if ($("hide-tour-pop-up") !== null) {
					$("hide-tour-pop-up").observe("click", function(e) {
						this.unstick();
						e.stop();
					}.bind(this));
				}
			}
		},
		hide: function() {
			$("tour-pop-up").hide();
			$("tour-btn").removeClassName('hover');
		},
		delayHide: function() {
			if (this.isSticky() === false) {
				this.timeout = this.hide.delay(0.1);
			}
		},
		show: function() {
			if (this.isSticky() === false) {
				clearTimeout(this.timeout);
			}
			$("tour-btn").addClassName('hover');
			$("tour-pop-up").show();
		},	
		resetPosition: function() {
			$("tour-pop-up").clonePosition($("tour-btn"), {
				setTop:		false,
				setWidth:	false,
				setHeight:	false,
				offsetLeft:	$("tour-btn").getWidth() / 2 - $("tour-pop-up").getWidth() / 2
			});
		},
		stick: function() {
			$("tour-pop-up").addClassName("sticky");
			this.show();
		},
		unstick: function() {
			this.hide();
			$("tour-pop-up").removeClassName("sticky");
		},
		isSticky: function() {
			return $("tour-pop-up").hasClassName("sticky");
		},
		setTitle: function(title) {
			$("tour-title").update(title);
		},
		setMessage: function(message) {
			$("tour-message").update(message);
		},
		setButtonText: function(buttonText) {
			$("tour-button-text").update(buttonText);
		},
		setBarWidth: function(barWidth) {
			$$("a#tour-btn span.bar")[0].setStyle({width: barWidth + 'px'});
		}
	});
	window.tourPopUp = new TourPopUp();

	// - - -

	window._numNavItems = 0;
	window._lastNavItem = false;
	for (var _i=0;;_i++) {
		_element = $("nav_" + _i.toString());

		if (_element === null) {
			break;
		}

		window._numNavItems++;

		Event.observe(_element,"mouseover",function(_event) {
			clearTimeout(_cl_timeouts._hideAllNavItems);

			var _element	= Event.element(_event);
			var _index		= getNumericIDFromElementID(_element.id);
			var _position	= _element.cumulativeOffset();

			if ((window._lastNavItem !== false) && (window._lastNavItem !== _index)) {
				hideAllNavItems();
			}

			$("nav_" + _index.toString()).className	= "hover";
			window._lastNavItem						= _index;
			var _subNav								= $("sub-nav_" + _index.toString());
			_subNav.style.left						= (_position.left.toString() + "px");
			_subNav.style.top						= ((_position.top + _element.getHeight()).toString() + "px");
			_subNav.show();
		});

		Event.observe(_element,"mouseout",function(_event) {
			_cl_timeouts._hideAllNavItems = hideAllNavItems.delay(0.5);
		});
		Event.observe(("sub-nav_" + _i.toString()),"mouseover",function(_event) {
			clearTimeout(_cl_timeouts._hideAllNavItems);
		});
		Event.observe(("sub-nav_" + _i.toString()),"mouseout",function(_event) {
			_cl_timeouts._hideAllNavItems = hideAllNavItems.delay(0.5);
		});

		$$("#sub-nav_" + _i.toString() + " span").each(function(_element) {
			Event.observe(_element,"mouseover",function(_event) {
				this.className = "active";
			}.bind(_element));
			Event.observe(_element,"mouseout",function(_event) {
				this.className = "";
			}.bind(_element));
		});
	}

	function hideAllNavItems() {
		for (var _i=0;_i<window._numNavItems;_i++) {
			$("sub-nav_" + _i.toString()).hide();
			$("nav_" + _i.toString()).className = "";
		}
	};

	/* Global Search Type */
	if ($('global-search-type') !== null) {
		function globalSearchDocumentHandler(e) {
			var element = Event.element(e);
			if (element.descendantOf('global-search-type') === false) {
				$('global-search-type-menu').hide();
				$('global-search-type-trigger').removeClassName('active');
				document.stopObserving('click', globalSearchDocumentHandler);
			}
		}
		Event.observe('global-search-type-trigger', 'click', function(_event) {
			$('global-search-type-menu').clonePosition($('global-search-type-trigger'), {
				setWidth:	false,
				setHeight:	false,
				offsetTop:	26,
				offsetLeft:	0 
			});
			$('global-search-type-trigger').toggleClassName('active');
			$('global-search-type-menu').toggle();
			if ($('global-search-type-menu').visible()) {
				document.observe('click', globalSearchDocumentHandler);
			} else {
				document.stopObserving('click', globalSearchDocumentHandler);
			}
		});
		$$('#global-search-type-menu a').each(function(a) {
			a.observe('click', function(e) {
				$('global-search-type-menu').hide();
				$('global-search-type-trigger').className = a.classNames();
				$('global-search-query-label').update(a.readAttribute('data-label'));
				$('global-search-form').writeAttribute('action', a.readAttribute('data-action'));
				document.stopObserving('click', globalSearchDocumentHandler);
				e.stop();
			});
		});
	}

	/* Global Create Button */
	if ($('global-create') !== null) {
		function globalCreateDocumentHandler(e) {
			var element = Event.element(e);
			if (element.descendantOf('global-create') === false) {
				$('global-create-menu').hide();
				$('global-create-trigger').removeClassName('active');
				document.stopObserving('click', globalCreateDocumentHandler);
			}
		}
		Event.observe('global-create-trigger', 'click', function(_event) {
			$('global-create-menu').clonePosition($('global-create-trigger'), {
				setWidth:	false,
				setHeight:	false,
				offsetTop:	29,
				offsetLeft:	-($('global-create-menu').getWidth()) + $('global-create-trigger').getWidth()
			});
			$('global-create-trigger').toggleClassName('active');
			$('global-create-menu').toggle();
			if ($('global-create-menu').visible()) {
				document.observe('click', globalCreateDocumentHandler);
			} else {
				document.stopObserving('click', globalCreateDocumentHandler);
			}
		});
	}

	// - - -

	["trend-search-query","blog-search-query"].each(function(_element) {
		if ($(_element) !== null) {
			_originalValues[_element] = $(_element).value;

			Event.observe(_element,"click",function() {
				if (this.value === _originalValues[_element]) {
					this.value		= "";
					this.className	= "active";
				}
			});
			Event.observe(_element,"focus",function() {
				if (this.value === _originalValues[_element]) {
					this.value		= "";
					this.className	= "active";
				}
			});
			Event.observe(_element,"blur",function() {
				if (this.value.strip() === "") {
					this.value		= _originalValues[_element];
					this.className	= "";
				}
			});
		}
	});

	// - - -

	if ($("channel-chooser_0") !== null) {
		var _element;
		window._numChannelTabs = 0;

		for (var _i=0;;_i++) {
			_element = $("channel-chooser_" + _i.toString());

			if (_element === null) {
				break;
			}
			window._numChannelTabs++;

			Event.observe(_element,"click",function(_event) {
				var _index = getNumericIDFromElementID(Event.element(_event).id);

				for (var _i=0;_i<window._numChannelTabs;_i++) {
					$("channel-chooser_" + _i.toString()).className = "";
				}
				$("channel-chooser_" + _index.toString()).className = "selected";

				new Ajax.Request("/ajax/index-channels",{
					method:		"get",
					parameters:	"channelID=" + _index.toString(),
					onSuccess:	function(_transport) {
						$("channel-content").update(_transport.responseText);
					}
				});
			});
		}
	}

	// - - -

	if (($("feature-followers_followers-btn") !== null) && ($("feature-followers_following-btn") !== null)) {
		featureFollowerHandler = function(_event) {
			var _element = Event.element(_event);
			["followers","following"].each(function(_element) {
				$("feature-followers_" + _element + "-btn").removeClassName("selected");
				$("feature-followers_" + _element).style.display = "none";
			});
			$(_element).addClassName("selected");
			$(_element.id.replace(/-btn$/,"")).style.display = "block";
		};

		Event.observe("feature-followers_followers-btn","click",featureFollowerHandler);
		Event.observe("feature-followers_following-btn","click",featureFollowerHandler);
	}

	// - - -

	if ($("userName_register") !== null) {
		Event.observe("userName_register","keyup",userName_registerOnChange);	// Typing
		Event.observe("userName_register","blur",userName_registerOnChange);	// Mouse right-click + paste
	}

	_domIsLoaded = true;
});

// - - - 

function setAutoGrowFeatures() {
	if (window._autoGrowIsAnimating === undefined) {
		window._autoGrowIsAnimating = {};
	}
	if (window._autoGrowCloseWhenOpened === undefined) {
		window._autoGrowCloseWhenOpened = {};
	}

	$A(arguments).each(function (_argument) {
		if (Object.isArray(_argument)) {
			setAutoGrowFeatures(_argument);
		} else {
			Event.observe(_argument + "-overlay","mousemove",function(_event) {
				window._autoGrowCloseWhenOpened[this.toString()] = false;
			}.bind(_argument));

			Event.observe(_argument + "-item","mouseenter",function(_event) {
				clearTimeout(_cl_timeouts._autoGrowingRow);

				window._autoGrowCloseWhenOpened[this.toString()] = false;

				_cl_timeouts._autoGrowingRow = (function() {
					var _type		= (/([a-z]+)-/).exec(this.toString())[1];
					var _elementID	= (this.toString() + "-overlay");
					var _height		= 115;
					var _duration	= 0.3;
					var _effects	= [];

					if ($(_elementID).getHeight() === _height) {
						return;
					}

					if (window._autoGrowIsAnimating[this.toString()]) {
						return;
					}

					_effects.push("new Effect.Morph(\""		+ _elementID + "\",{sync: true,style: \"margin-top: 0; height: " + _height.toString() + "px;\"})");
					_effects.push("new Effect.Opacity(\""	+ _elementID + "\",{to: 1.0,duration: 0.0})");

					if (_type === "p") {
						var _colorElements	= $$("#" + _elementID + " a.palette span.c");
						var _shadowElements	= $$("#" + _elementID + " a.palette span.c span.s");

						_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.palette")[0].identify() + "\",{sync: true,style: \"height: " + _height.toString() + "px;\"})");

						for (var _i=0,_rows=_colorElements.length;_i<_rows;_i++) {
							_effects.push("new Effect.Morph(\"" + _colorElements[_i].identify() + "\",{sync: true,style: \"height: " + _height.toString() + "px;\"})");
						}

						for (var _i=0,_rows=_shadowElements.length;_i<_rows;_i++) {
							_effects.push("new Effect.Morph(\"" + _shadowElements[_i].identify() + "\",{sync: true,style: \"margin-top: " + (_height - 5).toString() + "px;\"})");
						}
					} else if (_type === "c") {
						_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.color")[0].identify()		+ "\",{sync: true,style: \"height: "		+ _height.toString()		+ "px;\"})");
						_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.color span")[0].identify()	+ "\",{sync: true,style: \"margin-top: "	+ (_height - 5).toString()	+ "px;\"})");
					} else if ((_type === "n") || (_type === "pd") || (_type === "h")) {
						_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.pattern")[0].identify()			+ "\",{sync: true,style: \"height: "		+ _height.toString()		+ "px;\"})");
						_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.pattern span")[0].identify()	+ "\",{sync: true,style: \"margin-top: "	+ (_height - 5).toString()	+ "px;\"})");
					} else if (_type === "s") {
						_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.shape")[0].identify()					+ "\",{sync: true,style: \"height: "	+ _height.toString()		+ "px;\"})");
						_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.shape span.image")[0].identify()		+ "\",{sync: true,style: \"height: "	+ _height.toString()	+ "px;\"})");
						_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.shape span.image span")[0].identify()	+ "\",{sync: true,style: \"margin-top: "	+ (_height - 5).toString()	+ "px;\"})");
					}

					$(_elementID).show();

					eval("new Effect.Parallel([" + _effects.join(",") + "],{duration: " + _duration.toString() + ",transition: Effect.Transitions.easeOutCubic});");

					window._autoGrowIsAnimating[this.toString()] = true;
					(function() {
						delete window._autoGrowIsAnimating[this.toString()];
						if (window._autoGrowCloseWhenOpened[this.toString()]) {
							hideAutoGrowFeature(_argument);
						}
					}.bind(this)).delay(_duration);
				}.bind(this)).delay(0.5);
			}.bind(_argument));

			Event.observe(_argument + "-item","mouseleave",function(_event) {
				clearTimeout(_cl_timeouts._autoGrowingRow);
			});

			Event.observe(_argument + "-overlay","mouseleave",hideAutoGrowFeature.bind(_argument));
		}
	});
}

function hideAutoGrowFeature(_argument) {
	clearTimeout(_cl_timeouts._autoGrowingRow);

	if (_argument instanceof Event) {
		_argument = this.toString();
	}

	window._autoGrowCloseWhenOpened[_argument] = true;

	var _type		= (/([a-z]+)-/).exec(_argument)[1];
	var _elementID	= (_argument + "-overlay");
	var _height		= 50;
	var _duration	= 0.3;
	var _effects	= [];

	if ($(_elementID).getHeight() === _height) {
		return;
	}

	if (window._autoGrowIsAnimating[_argument]) {
		return;
	}

	_effects.push("new Effect.Morph(\"" + _elementID + "\",{sync: true,style: \"margin-top: 20px; height: "	+ _height.toString() + "px;\"})");

	if (_type === "p") {
		var _colorElements	= $$("#" + _elementID + " a.palette span.c");
		var _shadowElements	= $$("#" + _elementID + " a.palette span.c span.s");

		_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.palette")[0].identify() + "\",{sync: true,style: \"height: " + _height.toString() + "px;\"})");

		for (var _i=0,_rows=_colorElements.length;_i<_rows;_i++) {
			_effects.push("new Effect.Morph(\"" + _colorElements[_i].identify() + "\",{sync: true,style: \"height: " + _height.toString() + "px;\"})");
		}

		for (var _i=0,_rows=_shadowElements.length;_i<_rows;_i++) {
			_effects.push("new Effect.Morph(\"" + _shadowElements[_i].identify() + "\",{sync: true,style: \"margin-top: " + (_height - 5).toString() + "px;\"})");
		}
	} else if (_type === "c") {
		_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.color")[0].identify()		+ "\",{sync: true,style: \"height: "		+ _height.toString()		+ "px;\"})");
		_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.color span")[0].identify()	+ "\",{sync: true,style: \"margin-top: "	+ (_height - 5).toString()	+ "px;\"})");
	} else if ((_type === "n") || (_type === "pd") || (_type === "h")) {
		_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.pattern")[0].identify()			+ "\",{sync: true,style: \"height: "		+ _height.toString()		+ "px;\"})");
		_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.pattern span")[0].identify()	+ "\",{sync: true,style: \"margin-top: "	+ (_height - 5).toString()	+ "px;\"})");
	} else if (_type === "s") {
		_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.shape")[0].identify()					+ "\",{sync: true,style: \"height: "	+ _height.toString()		+ "px;\"})");
		_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.shape span.image")[0].identify()		+ "\",{sync: true,style: \"height: "	+ _height.toString()	+ "px;\"})");
		_effects.push("new Effect.Morph(\"" + $$("#" + _elementID + " a.shape span.image span")[0].identify()	+ "\",{sync: true,style: \"margin-top: "	+ (_height - 5).toString()	+ "px;\"})");
	}

	eval("new Effect.Parallel([" + _effects.join(",") + "],{duration: " + _duration.toString() + ",transition: Effect.Transitions.easeOutCubic});");

	window._autoGrowIsAnimating[this.toString()] = true;
	(function() {
		delete window._autoGrowIsAnimating[_argument];
		$(_elementID).hide();
	}).delay(_duration);

	(function () {
		new Effect.Opacity(_elementID,{to: 0.0,duration: 0.2});
	}).delay(0.1);
}

registerAccountSettingsOverlay = function() {
	Event.observe(window,"load",function(_event) {
		var _h = ($("sponsored-user-settings").getHeight().toString() + "px");
		$("non-sponsored-user-settings-overlay").setOpacity(0.8).setStyle({height: _h});
		$("non-sponsored-user-settings-container").setStyle({height: _h,marginTop: "-" + _h,display: "none"}).appear({duration: 0.6});
	});
};

CheckboxRangeCheck = Class.create({
	initialize: function(_formID,_checkboxIdPrefix,_checkboxIdRegex) {
		this._lastCheckboxClickedID	= "";
		this._checkboxIdPrefix		= _checkboxIdPrefix;
		this._checkboxIdRegex		= _checkboxIdRegex;

		var _elements = $$("#" + _formID + " input[type=checkbox]").findAll(function(_element) {
			return this.test(_element.id);
		}.bind(this._checkboxIdRegex));

		if (_elements.length !== 0) {
			_elements.each(function (_element) {
				Event.observe(_element,"click",function(_event) {
					var _element = Event.element(_event);

					if (_event.shiftKey) {
						if (this._lastCheckboxClickedID !== "") {
							if ((_element.checked) && ($(this._lastCheckboxClickedID).checked)) {

								var _startIndex	= parseInt(this._checkboxIdRegex.exec(this._lastCheckboxClickedID)[1],10);
								var _endIndex	= parseInt(this._checkboxIdRegex.exec(_element.id)[1],10);

								if (_endIndex < _startIndex) {
									var _tmp	= _startIndex;
									_startIndex	= _endIndex;
									_endIndex	= _tmp;
								}

								var _i = _startIndex;
								while (true) {
									++_i;

									if (_i > _endIndex) {
										break;
									}

									$(this._checkboxIdPrefix + _i.toString()).checked = true;
								}
							}
						}
					}

					this._lastCheckboxClickedID = _element.id;
				}.bind(this));
			}.bind(this));
		}
	}
});

// Stolen from Lightbox:
getPageSize =  function() {
	var xScroll, yScroll;
	if (window.innerHeight && window.scrollMaxY) {
		xScroll = window.innerWidth + window.scrollMaxX;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight){
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	} else {
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}
	var windowWidth, windowHeight;
	if (self.innerHeight) {
		if(document.documentElement.clientWidth){
			windowWidth = document.documentElement.clientWidth;
		} else {
			windowWidth = self.innerWidth;
		}
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) {
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) {
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}
	if(yScroll < windowHeight){
		pageHeight = windowHeight;
	} else { 
		pageHeight = yScroll;
	}
	if(xScroll < windowWidth){
		pageWidth = xScroll;
	} else {
		pageWidth = windowWidth;
	}
	return [pageWidth,pageHeight,windowWidth,windowHeight];
};
function getPageScroll() {
	var yScroll;
	if (self.pageYOffset) {
		yScroll = self.pageYOffset;
	} else if (document.documentElement && document.documentElement.scrollTop) {
		yScroll = document.documentElement.scrollTop;
	} else if (document.body) {
		yScroll = document.body.scrollTop;
	}
	return ['',yScroll];
};
// / Stolen from Lightbox

closeSiteBanner = function(_elementID,_ts) {
	Effect.BlindUp(_elementID,{duration: 0.5});

	if ($("header-colors") !== null) {
		(function() {
			$("header-colors").appear({duration: 0.3});
		}).delay(0.5);
	}

	setCookie("hide-site-banner-" + _ts.toString(),1,(3600 * 24 * 365));
};

setCookie = function(_name,_value,_expiresFromNow) {
	_expiresFromNow	= parseInt(_expiresFromNow,10);
	_expires		= new Date();
	if ((isNaN(_expiresFromNow) === false) && (_expiresFromNow !== 0)) {
		_expires.setTime((new Date()).getTime() + (_expiresFromNow * 1000)); // Convert to microseconds
	}

	document.cookie = (_name + "=" + escape(_value) + "; expires=" + _expires.toGMTString() + "; path=/; domain=" + _cookieDomain);
};

getRandStr = function(_length) {
	var _chars		= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
	var _numChars	= _chars.length;
	var _return		= "";
	_length			= parseInt(_length,10);

	for (var _i=0;_i<_length;_i++) {
		_return += _chars.substr(Math.floor(Math.random() * _numChars),1);
	}

	return _return;
};

userName_registerOnChange = function(_event) {
	clearTimeout(_cl_timeouts._checkForUserNameAvailability);
	_cl_timeouts._checkForUserNameAvailability = checkForUserNameAvailability.bind(this,_event).delay(0.7);
};
checkForUserNameAvailability = function(_event) {
	if (this.value !== _lastUserNameChecked) {
		new Ajax.Request("/ajax/check-username-availability",{
			sanitizeJSON:	true,
			method:			"post",
			parameters:		"userName=" + encodeURIComponent(this.value),
			onSuccess:		function(_transport) {
				var _text	= "Uh oh, that Username is taken.";
				var _class	= "message-error";
				if (_transport.responseJSON._status === "available") {
					_text	= "Nice Username, suits you well.";
					_class	= "message-success";
				}
				$("userName_registerIndicator").update(_text);
				$("userName_registerIndicator").className = _class;
				$("userName_registerIndicator").appear({duration: 0.4});
			}
		});

		_lastUserNameChecked = this.value;
	}
};

getS3URL = function(_url) {
	return "http://colourlovers.com.s3.amazonaws.com" + _url;
};

getStaticURL = function(_url) {
	return "http://static.colourlovers.com" + _url;
};

returnEmptyStringIfUndefinedOrNull = function(_value) {
	return ((_value === undefined) || (_value === null)) ? "" : _value;
};

getImgURL = function(_uri,_userLang) {
	var _userLang = (_userLang === undefined) ? _lang : _userLang;
	return getStaticURL("/images/" + _cSV + "/" + _userLang + _uri);
};

getNumericallyShardedDirectory = function(_path,_id,_levels) {
	var _dir	= "";
	_levels		= parseInt(_levels,10);

	if (_levels === 1) {
		// id = 1234567: /1234
		_dir = _path.replace((/%s/),Math.floor(_id / 1000));
	} else if (_levels === 2) {
		// id = 1234567: /123/1234
		_dir = _path.replace((/%s/),Math.floor(_id / 10000) + "/" + Math.floor(_id / 1000));
	} else if (_levels === 3) {
		// id = 1234567: /123/1234/1234567
		_dir = _path.replace((/%s/),Math.floor(_id / 10000) + "/" + Math.floor(_id / 1000) + "/" + _id);
	}

	return _dir;
}

getNumericIDFromElementID = function(_elementID) {
	// Expects something like: someID_123
	return parseInt((/^[^\s]+_([0-9]+)$/).exec(_elementID)[1],10);
};

within=function(_val,_low,_high){alert("use isWithinRange()");};
isHex=function(_hex){alert("use isValidHex()");};
Array.prototype.implode=function(_char){alert("implode deprecated, use join()");};

isWithinRange = function(_val,_low,_high) {
	return ((_val >= _low) && (_val <= _high));
};

isValidHex = function(_hex) {
	return (/^[a-fA-F0-9]{6}$/).test(_hex);
};

dec2hex = function(_dec) {
	var _hexChars = "0123456789ABCDEF", _hex = "";
	while (_dec > 15) {
		_hex = (_hexChars.charAt((_dec - (Math.floor(_dec / 16)) * 16)) + _hex);
		_dec = Math.floor(_dec / 16);
	}
	return (_hexChars.charAt(_dec) + _hex);
};

hex2dec = function(_hex) {
	return parseInt(_hex,16);
};

// copaso, FCP
addEvent = function(_function,_event) {
	if ((document.all) && (window.attachEvent)) {
		window.attachEvent("on" + _event,_function);
	} else if (window.addEventListener) {
		window.addEventListener(_event,_function,false);
	}
};

//Used by FCP
domEvent = function(_event) {
_event = (_event) ? _event : window.event;

// Opera hates this for some reason:
if (!window.opera && _event.srcElement) {
	_event.target = _event.srcElement;
}
if (_event.keyCode) {
	_event.code = _event.keyCode;
} else if (_event.which) {
	_event.code = _event.which;
} else {
	_event.code = _event.charCode;
}
return _event;
};

forumPollRadioOnClick = function(_this) {
	if ($("pollAnswerOther") !== null) {
		$("pollAnswerOther").disabled = !(_this.id === "pollOptionID_1");
	}
	$("addACommentSubmitBtn").value	= "Post Comment and Cast Vote";
	$("pollOptionID_comment").value	= _this.value;
	if ($("forumCastVoteSubmitBtnDiv").style.display === "none") {
		Effect.BlindDown("forumCastVoteSubmitBtnDiv",{duration: 0.4});
	}
};

togglePollDisplay = function(_area,_element) {
	if (_area === "forums") {
		if (_element.checked) {
			$("discussion-comment-required").className = "";
			Effect.BlindDown("add-poll-div",{duration: 0.4});
		} else {
			$("discussion-comment-required").className = "required";
			Effect.BlindUp("add-poll-div",{duration: 0.4});
		}
		for (var _i=0;_i<10;_i++) {
			$("pollOptions_" + _i).disabled		= !_element.checked;
			$("pollOptionURLs_" + _i).disabled	= !_element.checked;
		}
		$("pollTitle").disabled			= !_element.checked;
		$("pollEndDate_day").disabled	= !_element.checked;
		$("pollEndDate_month").disabled	= !_element.checked;
		$("pollEndDate_year").disabled	= !_element.checked;
		$("pollDesc").disabled			= !_element.checked;
		$("commentBox").disabled		= _element.checked;
	}
};

// Check teatarea length //
checkTALen = function(_elementID,_length) {
	var _taLength	= $(_elementID).value.length;
	var _numLeft	= (_length - _taLength);
	_numLeft		= (_numLeft < 0) ? 0 : _numLeft;

	$(_elementID + "count").update(_numLeft + " Characters Left");

	if (_taLength > _length) {
		$(_elementID).value = $(_elementID).value.substr(0,_length);
		$(_elementID + "count").innerText = "0 Characters Left";
	}
};

// prototype
absPos = function(_object) {
var r = {x: _object.offsetLeft,y: _object.offsetTop};

if (_object.offsetParent) {
	var v	= absPos(_object.offsetParent);
	r.x		+= v.x;
	r.y		+= v.y;
}
return r;
};

paletteDetail = function() {
	if (_paletteColorsUI === undefined) {
		return;
	}

	var _widths = [], _heights = [], _elements = [];
	var _pageSize	= getPageSize();
	var _numColors	= _paletteColorsUI._colors.length;
	var _width		= (_pageSize[2] - 150);
	var _height		= (_pageSize[3] - 150);
	_angle			= (_angle === 4) ? 0 : _angle;

	if ((_angle % 2) === 1) {
		// Laying down
		_heights = palette_getConstraintWidths(_height);

		for (var _i=0;_i<_numColors;_i++) {
			_elements.push(Builder.node("a",{className: "block",href: "#",onclick: "return false;",style: "width: " + _width.toString() + "px; height: " + _heights[_i] + "px; background-color: #" + _paletteColorsUI._colors[_i] + ";"}));
		}
	} else {
		// Standing up
		_widths = palette_getConstraintWidths(_width);

		for (var _i=0;_i<_numColors;_i++) {
			_elements.push(Builder.node("a",{className: "left block",onclick: "return false;",style: "width: " + _widths[_i] + "px; height: " + _height.toString() + "px; background-color: #" + _paletteColorsUI._colors[_i] + ";"}));
		}
	}

	if (_angle >= 2) {
		_elements.reverse();
	}

	$("cl-overlay-content").update();
	$("cl-overlay-content").appendChild(Builder.node("span",{className: "block",style: "height: " + (_paletteColorsUI._y.toString() + "px")},_elements));
	$("cl-overlay-content").appendChild(Builder.node("span",{className: "clear"}));
	$("cl-overlay-content").style.width		= (_width) + "px";
	$("cl-overlay-content").style.height	= (_height) + "px";
	$("cl-overlay-content").onclick			= hideOverlay;
	showOverlay([_width,_height]);
};

colorDetail = function() {
	if (_colorUiHex === undefined) {
		return;
	}

	var _pageSize									= getPageSize();
	var _width										= (_pageSize[2] - 150);
	var _height										= (_pageSize[3] - 150);
	$("cl-overlay-content").style.backgroundColor	= ("#" + _colorUiHex);;
	$("cl-overlay-content").style.width				= (_width) + "px";
	$("cl-overlay-content").style.height			= (_height) + "px";
	$("cl-overlay-content").onclick					= hideOverlay;
	showOverlay([_width,_height]);
};

patternImgDetail = function(_patternID,_location,_ts) {
	if (_patternID === 0) {
		_url = _location;
	} else {
		_url = getS3URL("/images/patterns/" + parseInt(_patternID / 1000,10) + "/" + _patternID + ".png?" + _ts.toString());
	}

	var _pageSize								= getPageSize();
	$("cl-overlay-content").style.background	= "transparent url(" + _url + ") center center";
	$("cl-overlay-content").style.width			= (_pageSize[2] - 150) + "px";
	$("cl-overlay-content").style.height		= (_pageSize[3] - 150) + "px";
	$("cl-overlay-content").onclick				= hideOverlay;
	showOverlay([(_pageSize[2] - 150),(_pageSize[3] - 150)]);
};

function patternDefinitionDetail(_patternDefinitionID,_ts) {
	_url = getStaticURL("/images/patternDefinitions/" + parseInt(_patternDefinitionID / 10000,10) + "/" + parseInt(_patternDefinitionID / 1000,10) + "/" + _patternDefinitionID + ".png?" + _ts.toString());

	var _pageSize								= getPageSize();
	$("cl-overlay-content").style.background	= "transparent url(" + _url + ") center center";
	$("cl-overlay-content").style.width			= (_pageSize[2] - 150) + "px";
	$("cl-overlay-content").style.height		= (_pageSize[3] - 150) + "px";
	$("cl-overlay-content").onclick				= hideOverlay;
	showOverlay([(_pageSize[2] - 150),(_pageSize[3] - 150)]);
}

hideObtrusiveElements = function() {
	// Hide all object / embed elements - Thanks, lightbox
	$$("select","object","embed").each(function(_element) {
		_element.style.visibility = "hidden";
	});
};

showObtrusiveElements = function() {
	// Show all object / embed elements - Thanks, lightbox
	$$("select","object","embed").each(function(_element) {
		_element.style.visibility = "visible";
	});
};

// Overlay //
showOverlay = function(_overlayContentDimensions) {
	var _pageSize					= getPageSize();
	_lastOverlayDimensions			= _overlayContentDimensions;

	hideObtrusiveElements();

	$("cl-overlay").style.height = (_pageSize[1] + "px");
	$("cl-overlay").show();

	var _overlayContentTop	= (getPageScroll()[1] + ((_pageSize[3] - _overlayContentDimensions[1] - 20) / 2)); // -20 for border
	var _overlayContentLeft	= ((_pageSize[0] - _overlayContentDimensions[0] - 20) / 2); // -20 for border

	$("cl-overlay-content").style.top	= (_overlayContentTop < 0)	? 0 : _overlayContentTop.toString() + "px";
	$("cl-overlay-content").style.left	= (_overlayContentLeft < 0)	? 0 : _overlayContentLeft.toString() + "px";
	$("cl-overlay-content").show();

	$("cl-overlay").style.height = (getPageSize()[1] + "px");
};

hideOverlay = function() {
	$("cl-overlay").hide();
	$("cl-overlay-content").hide();

	showObtrusiveElements();
};

modComment = function(_commentType,_commentID,_commentI) {
	if (_domIsLoaded) {
		var _modDiv			= $(_commentType + "_cm_" + _commentID);
		var _modDivHeight	= $(_commentI).getHeight() + 31; // OB31E
		var _comment		= _modDiv.innerHTML.base64_decode();
		var _textareaID		= ("comments" + _commentType + _commentID + _commentI);
		_modDiv.update();

		var _modCommentForm = document.createElement("form");
		_modCommentForm.setAttribute("action","/op/mod/comment/" + _commentType + "/" + _commentID.toString());
		_modCommentForm.setAttribute("method","post");
		_modDiv.insertBefore(_modCommentForm,_modDiv.firstChild);

		var _submitBtn = document.createElement("input");
		_submitBtn.setAttribute("type","image");
		_submitBtn.setAttribute("class","outline");
		_submitBtn.setAttribute("src",getImgURL("/btn/submit.png"));
		_modCommentForm.insertBefore(_submitBtn,_modCommentForm.firstChild);

		var _commentTextarea = document.createElement("textarea");
		_commentTextarea.setAttribute("name","comments");
		_commentTextarea.setAttribute("id",_textareaID);
		_commentTextarea.onselect				= new Function("storeCaret($('" + _textareaID + "'));");
		_commentTextarea.onclick				= new Function("storeCaret($('" + _textareaID + "'));");
		_commentTextarea.onkeyup				= new Function("storeCaret($('" + _textareaID + "'));");
		_commentTextarea.onchange				= new Function("storeCaret($('" + _textareaID + "'));");
		_commentTextarea.className				= "formElement";
		_commentTextarea.style.width			= "440px";
		_commentTextarea.style.border			= "0 none";
		_commentTextarea.style.backgroundColor	= "#FFF5F5";
		_commentTextarea.style.height			= (_modDivHeight.toString() + "px");
		_commentTextarea.style.marginBottom		= "10px";
		_modCommentForm.insertBefore(_commentTextarea,_modCommentForm.firstChild);
		_commentTextarea.value = _comment;

		var _htmlBtns = document.createElement("div");
		_htmlBtns.className = "html-btns";
		_htmlBtns.innerHTML = "<a href=\"#\" onclick=\"fmtTxt('" + _textareaID + "','<strong>','</strong>'); return false;\" class=\"bold\" title=\"Bold\" /><span></span></a>";
		_htmlBtns.innerHTML += "<a href=\"#\" onclick=\"fmtTxt('" + _textareaID + "','<em>','</em>'); return false;\" class=\"italic\" title=\"Italic\" /><span></span></a>";
		_htmlBtns.innerHTML += "<a href=\"#\" onclick=\"fmtTxtUnderline('" + _textareaID + "'); return false;\" class=\"underline\" title=\"Underline\" /><span></span></a>";
		_htmlBtns.innerHTML += "<a href=\"#\" onclick=\"fmtTxtImage('" + _textareaID + "'); return false;\" class=\"image\" title=\"Insert Image\" /><span></span></a>";
		_htmlBtns.innerHTML += "<a href=\"#\" onclick=\"fmtTxtURL('" + _textareaID + "'); return false;\" class=\"url\" title=\"Insert Link\" /><span></span></a>";
		_htmlBtns.innerHTML += "<a href=\"#\" onclick=\"fmtTxt('" + _textareaID + "','<blockquote>','</blockquote>'); return false;\" class=\"blockquote\" title=\"Quote\" /><span></span></a>";
		_htmlBtns.innerHTML += "<span class=\"notice\">Some HTML OK</span>\n";
		_modCommentForm.insertBefore(_htmlBtns,_modCommentForm.firstChild);

		$(_commentType + "_mc_" + _commentID).update("Options Disabled While Editing");
		$(_commentI).style.display	= "none";
		_modDiv.style.display		= "block";
		_commentTextarea.focus();
	}
};

buildAjaxRequest = function(_uri,_args,_callback) {
	var _parameters = ((_args !== undefined) ? "args=" + encodeURIComponent(_args) : "");

	if (Object.isFunction(_callback) === false) {
		_callback = function(_transport) {
			var _responseArray = _transport.responseText.split("|");

			if (_responseArray[0] === "redirect") {
				window.location.href = _responseArray[1];
			}
		};
	}

	new Ajax.Request("/ajax/" + _uri,{
		parameters:	_parameters,
		onSuccess:	function(_transport) {
			this(_transport);
		}.bind(_callback)
	});
};

buildAjaxUpdaterRequest = function(_file,_args,_page,_parameters,_showLoadingFlash,_updateElementID,_anchor) {
	// Only use this for get requests which will return HTML
	// _file needs to also be the elementID of the update()able HTML container, unless _updateElementID is set
	// _args is optional, NEEDS TO LOOK LIKE THIS: p/12/223
	// _page is optional, needs to be an integer
	// _parameters is optional, needs to be a JSON string
	// _showLoadingFlash is optional, needs to be bool
	// _updateElementID is optional, needs to be a string
	// _anchor is optional, needs to be a string

	_args		= Object.isString(_args)								? ("/" + _args)			: "";
	_page		= (Object.isString(_page) || Object.isNumber(_page))	? parseInt(_page,10)	: 1;
	_page		= ("/_page_" + _page.toString());
	_parameters	= Object.isString(_parameters) ? _parameters.evalJSON(true) : "";

	if (Object.isString(_updateElementID)) {
		if (_parameters === "") {
			_parameters = {"contentElementID": _updateElementID};
		} else {
			_parameters["contentElementID"]	= _updateElementID
		}
	} else {
		_updateElementID = _file;
	}

	if ($(_updateElementID) === null) {
		alert("ERROR: Cannot find element: " + _updateElementID);
	}

	new Ajax.Request("/ajax/" + _file + _args + _page,{
		method:		"get",
		parameters:	_parameters,
		onSuccess:	function(_transport) {
			$(this._updateElementID).update(_transport.responseText);

			if (this._anchor !== undefined) {
				goToAnchor(_anchor);
			}
		}.bind({_updateElementID: _updateElementID,_anchor: _anchor}) // Otherwise the string will bind as an Object
	});
};

goToAnchor = function(_anchor) {
	if (_anchor.strip() !== "") {
		var _element = $$("a[name=" + _anchor + "]")[0];
		if (_element !== undefined) {
			Effect.ScrollTo(_element,{duration: 0.5});
		} else { // JIC
			window.location.href = (window.location.href.replace((/#.+/),"") + "#" + _anchor);
		}
	}
};

palette_getConstraintWidths = function(_constraint) {
	if (_paletteColorsUI._widths === undefined) {
		return palette_getEvenWidths(_constraint);
	}

	_constraint		= parseInt(_constraint,10);
	var _return		= [];
	var _tmp		= 0;
	var _total		= 0;
	var _numColors	= _paletteColorsUI._colors.length;

	if (_numColors !== 0) {
		for (var _i=0;_i<_numColors;_i++) {
			_tmp		= Math.round(_constraint * _paletteColorsUI._widths[_i]);
			_return[_i]	= _tmp;
			_total		+= _tmp;
		}

		var _offset = parseFloat(_constraint - _total);
		if (_offset !== 0.0) {
			_return[_numColors - 1] = parseInt(_return[_numColors - 1] + _offset,10);
		}
	}

	return _return;
};

function palette_getEvenWidths(_constraint,_numColors) {
	_constraint	= parseInt(_constraint,10);
	_numColors	= (_numColors === undefined) ? _paletteColorsUI._colors.length : _numColors;
	var _return	= [];

	if (_numColors !== 0) {
		var _fill	= Math.floor(_constraint / _numColors);
		for (var _i=0;_i<_numColors;_i++) {
			_return.push(_fill);
		}
		var _total	= (_fill * _numColors);
		var _i		= 0;

		while (_constraint !== _total) {
			_return[_i++]++;
			++_total;
		}
	}

	return _return;
};

function palette_getUniversalColorsUI(_width,_height,_url,_hexs,_widths,_showbottomShadow,_includeLink) {
	_width				= parseInt(_width,10);
	_height				= parseInt(_height,10);
	_widths				= (_widths === undefined)			? false	: _widths;
	_showbottomShadow	= (_showbottomShadow === undefined)	? true	: _showbottomShadow;
	_includeLink		= (_includeLink === undefined)		? true	: _includeLink;
	var _numColors		= _hexs.length;
	var _return			= "";

	if (_widths === false) {
		_widths = palette_getEvenWidths(_width,_numColors);
	}

	_marginTop = (_height - 5);

	_return	+= _includeLink ? "<a href=\"" + _url + "\" class=\"palette\" style=\"width: " + _width.toString() + "px; height: " + _height.toString() + "px;\">" : "";
		for (_i=0;_i<_numColors;_i++) {
			_return += "<span class=\"c\" style=\"width: " + _widths[_i].toString() + "px; height: " + _height.toString() + "px; background-color: #" + _hexs[_i] + ";\">" + (_showbottomShadow ? "<span class=\"s\" style=\"margin-top: " + _marginTop.toString() + "px;\"></span>" : "") + "</span>\n";
		}
	_return += _includeLink ? "</a>" : "";

	return _return;
}

updatePaletteColorsUI = function() {
	if (_paletteColorsUI === undefined) {
		return;
	}

	var _widths = [], _heights = [], _elements = [];
	var _pageSize	= getPageSize();
	var _numColors	= _paletteColorsUI._colors.length;
	var _url		= "/paletteImgDetail/" + _pageSize[0] + "/" + _pageSize[1] + "/" + _paletteColorsUI._colors.join("/") + "/" + _paletteColorsUI._title + ".png";
	if (_paletteColorsUI._widths !== undefined) {
		_url += "?cPW=" + _paletteColorsUI._widths.join(",").base64_encode();
	}
	_angle = (_angle === 4) ? 0 : _angle;

	if ((_angle % 2) === 1) {
		// Laying down
		_heights = palette_getConstraintWidths(_paletteColorsUI._y);

		for (var _i=0;_i<_numColors;_i++) {
			_elements.push(Builder.node("a",{className: "pointer block",href: "#",onclick: "paletteDetail(); return false;",style: "width: " + _paletteColorsUI._x.toString() + "px; height: " + _heights[_i] + "px; background-color: #" + _paletteColorsUI._colors[_i] + ";"}));
		}
	} else {
		// Standing up
		_widths = palette_getConstraintWidths(_paletteColorsUI._x);

		for (var _i=0;_i<_numColors;_i++) {
			_elements.push(Builder.node("a",{className: "left pointer block",href: "#",onclick: "paletteDetail(); return false;",style: "width: " + _widths[_i] + "px; height: " + _paletteColorsUI._y.toString() + "px; background-color: #" + _paletteColorsUI._colors[_i] + ";"}));
		}
	}

	if (_angle >= 2) {
		_elements.reverse();
	}

	$("palette-colors-ui").update();
	$("palette-colors-ui").appendChild(Builder.node("span",{className: "block",style: "height: " + (_paletteColorsUI._y.toString() + "px")},_elements));
	$("palette-colors-ui").appendChild(Builder.node("span",{className: "clear"}));
	$("palette-colors-ui").style.width = (_paletteColorsUI._x.toString() + "px");
};

rotatePaletteUI = function() {
	++_angle;
	updatePaletteColorsUI();
};

rmLoveNoteConf = function(_amt) {
	_amt	= parseInt(_amt,10);
	var _go	= false;

	if (_amt === 1) {
		_go = confirm("Are you sure you want to Delete this Love Note?");
	} else {
		_go = confirm("Are you sure you want to Delete these Love Notes?");
	}
	if (_go) {
		$("rm-love-notes-form").submit();
	}
};

toggleAll = function(_className,_element) {
	if (_domIsLoaded) {
		$$("." + _className).each(function (_element) {
			_element.checked = this.checked;
		}.bind(_element));
	}
};

setCaret = function(_elementID,_position) {
	if ($(_elementID).createTextRange) {
		var _range = $(_elementID).createTextRange();
		_range.move("character",_position);
		_range.select();
	} else if ($(_elementID).selectionStart) {
		$(_elementID).setSelectionRange(_position,_position);
	}
};

prepareNextAddRmScoreState = function () {
	if (window._nextAddRmScoreState === undefined) {
		window._nextAddRmScoreState = {};
	}
};

addScore = function (_contextType,_contextID,_btnID,_unloveThisBtnID,_loveNumDiv) {
	_contextID	= parseInt(_contextID,10);

	if (isNaN(_contextID) === false) {
		prepareNextAddRmScoreState();
		if (window._nextAddRmScoreState[_contextType + _contextID.toString()] === "rm") {
			return false;
		}
		window._nextAddRmScoreState[_contextType + _contextID.toString()] = "rm";

		new Ajax.Request("/ajax/add/score/" + _contextType + "/" + _contextID.toString(),{
			method:		"post",
			onSuccess:	function(_transport) {
				if ($(this._btnID) !== null) {
					$(this._btnID).fade({duration: 0.4});
				}
				if ($(this._unloveThisBtnID) !== null) {
					(function() {
					    $(this).appear({duration: 0.4});
					}.bind(this._unloveThisBtnID)).delay(0.5);
				}
				if ($(this._loveNumDiv) !== null) {
					$(this._loveNumDiv).innerHTML = (parseInt($(this._loveNumDiv).innerHTML.replace((/,/),""),10) + 1).toString().formatNumber();
				}
				if (_transport.responseJSON.showTourPopUp) {
					window.tourPopUp.setTitle(_transport.responseJSON.tourTitle);
					window.tourPopUp.setMessage(_transport.responseJSON.tourMessage);
					window.tourPopUp.setButtonText(_transport.responseJSON.tourButtonText);
					window.tourPopUp.setBarWidth(_transport.responseJSON.tourBarWidth);
					window.tourPopUp.stick();
				}
			}.bind({_btnID: _btnID,_unloveThisBtnID: _unloveThisBtnID,_loveNumDiv: _loveNumDiv})
		});
	}
	return false;
};

rmScore = function (_contextType,_contextID,_btnID,_unloveThisBtnID,_loveNumDiv) {
	_contextID	= parseInt(_contextID,10);

	if (isNaN(_contextID) === false) {
		prepareNextAddRmScoreState();
		if (window._nextAddRmScoreState[_contextType + _contextID.toString()] === "add") {
			return false;
		}
		window._nextAddRmScoreState[_contextType + _contextID.toString()] = "add";

		new Ajax.Request("/ajax/rm/score/" + _contextType + "/" + _contextID.toString(),{
			method:		"post",
			onSuccess:	function(_transport) {
				if ($(this._unloveThisBtnID) !== null) {
					$(this._unloveThisBtnID).fade({duration: 0.4});
				}
				if ($(this._btnID) !== null) {
					(function() {
					    $(this).appear({duration: 0.4});
					}.bind(this._btnID)).delay(0.5);
				}
				if ($(this._loveNumDiv) !== null) {
					$(this._loveNumDiv).innerHTML = (parseInt($(this._loveNumDiv).innerHTML.replace((/,/),""),10) - 1).toString().formatNumber();
				}
			}.bind({_btnID: _btnID,_unloveThisBtnID: _unloveThisBtnID,_loveNumDiv: _loveNumDiv})
		});
	}
	return false;
};

function muteNotification(contextType,contextID,state,settings) {
	if (confirm("Are you sure you want to " + (state ? "" : "un-") + "mute this conversation?")) {
		jQuery.post("/ajax/" + (state ? "add" : "rm") + "/muted-notification/" + contextType + "/" + contextID.toString(),settings,function (data) {
			var tmp = "mute-" + contextType + "-" + contextID.toString();

			jQuery("#" + (state ? "" : "un") + tmp).hide();
			jQuery("#" + (state ? "un" : "") + tmp).show();
		});
	}
}

addAjaxComment = function (_contextType,_contextID,_miscVerification) {
	_contextID = parseInt(_contextID,10);

	if (isNaN(_contextID) === false) {
		if (_miscVerification !== undefined) {
			var _Verify = new Verify();
			var _numFields = _miscVerification.length;

			for (var _i=0;_i<_numFields;_i++) {
				_Verify.addElement(_miscVerification[_i]);
			}
			if (_Verify_poll.verify() === false) {
				return false;
			}
		}

		var _comments = $("ajax-comments").value.stripLowerASCII().strip();
		if (_comments !== "") {
			$("ajax-comments").value = "";

			var _parameters = "comments=" + encodeURIComponent(_comments);

			if ($("pollID") !== null) {
				_parameters += ("&pollID=" + encodeURIComponent($("pollID").value));
			}
			if ($("pollOptionID_comment") !== null) {
				_parameters += ("&pollOptionID=" + encodeURIComponent($("pollOptionID_comment").value));
			}
			if ($("pollAnswerOther_comment") !== null) {
				_parameters += ("&pollAnswerOther=" + encodeURIComponent($("pollAnswerOther_comment").value));
			}
			if ($("comment-loading-indicator") !== null) {
				$("comment-loading-indicator").show();
			}

			new Ajax.Request("/ajax/add/comment/" + _contextType + "/" + _contextID.toString(),{
				method:		"post",
				parameters:	_parameters,
				onSuccess:	function(_transport) {
					var _responseArray = _transport.responseText.split("|");

					if (_responseArray[0] === "login") {
						window.location.href = "/login?r=" + encodeURIComponent(_responseArray[1]);
					}
				}
			});
		} else {
			alert("Please add some comments");
			$("ajax-comments").activate();
		}
	}
	return false;
};

initModLinkCountdown = function(_elementID,_timeout,_containerElementID) {
	_containerElementID	= (_containerElementID === undefined) ? _elementID : _containerElementID;
	var _args			= {_elementID: _elementID,_timeout: _timeout,_containerElementID: _containerElementID};

	new PeriodicalExecuter(function(_pe) {
		var _secondsLeft = Math.round(((this._timeout * 1000) - (new Date()).valueOf()) / 1000);
		var _minutesLeft = Math.floor(_secondsLeft / 60);

		if (_secondsLeft > 0) {
			_secondsLeft = Math.floor(_secondsLeft % 60);
			$(this._elementID).update(_minutesLeft.toString() + ":" + _secondsLeft.toString().padLeft("0",1) + " Left");
		} else {
			$(this._elementID).update("0:00 Left");
			$(this._containerElementID).fade({duration: 0.4});
			_pe.stop();
		}
	}.bindAsEventListener(_args),1);
};

showDatePicker = function(_elementID,_date) {
	var _days = [], _daysClasses = [], _dates = [];

	_date = new Date((_date === undefined)	? Date.parse($(_elementID).value)	: Date.parse(_date));
	_date = (isNaN(_date))					? new Date()						: _date;

	var _numDaysInThisMonth		= parseInt(32 - (new Date(_date.getFullYear(),_date.getMonth(),32).getDate()),10);
	var _firstDayOffset			= (new Date(_date.getFullYear(),_date.getMonth(),1)).getDay();
	var _numDaysInLastMonth		= parseInt(32 - (new Date(_date.getFullYear(),_date.getMonth() - 1,32).getDate()),10);
	var _numWeeksInThisMonth	= Math.ceil((_numDaysInThisMonth + _firstDayOffset) / 7);
	var _numDaysTrailing		= parseInt((_numWeeksInThisMonth * 7) - _numDaysInThisMonth - _firstDayOffset,10);
	var _offset					= absPos($(_elementID));
	var _lastMonth				= new Date(_date.getFullYear(),_date.getMonth() - 1,_date.getDate());
	var _nextMonth				= new Date(_date.getFullYear(),_date.getMonth() + 1,_date.getDate());
	var _lastMonthURL			= (_lastMonth.getMonth() + 1).toString() + "/" + _lastMonth.getDate().toString() + "/" + _lastMonth.getFullYear().toString();
	var _nextMonthURL			= (_nextMonth.getMonth() + 1).toString() + "/" + _nextMonth.getDate().toString() + "/" + _nextMonth.getFullYear().toString();
	_lastMonth					= (_monthNames[_lastMonth.getMonth()] + " " + _lastMonth.getFullYear().toString());
	_nextMonth					= (_monthNames[_nextMonth.getMonth()] + " " + _nextMonth.getFullYear().toString());

	if (_firstDayOffset !== 0) {
		_days			= _days.concat($A($R(_numDaysInLastMonth - _firstDayOffset + 1,_numDaysInLastMonth)));
		_daysClasses	= _daysClasses.concat([].fill(0,_firstDayOffset," class=\"darkTD\""));

		for (var _i=_firstDayOffset - 1;_i>=0;_i--) {
			_dates.push(new Date(_date.getFullYear(),_date.getMonth() - 1,_numDaysInLastMonth - _i));
		}
	}

	_days			= _days.concat($A($R(1,_numDaysInThisMonth)));
	_daysClasses	= _daysClasses.concat([].fill(0,_numDaysInThisMonth,""));
	for (var _i=1;_i<=_numDaysInThisMonth;_i++) {
		_dates.push(new Date(_date.getFullYear(),_date.getMonth(),_i));
	}

	if (_numDaysTrailing !== 0) {
		_days			= _days.concat($A($R(1,_numDaysTrailing)));
		_daysClasses	= _daysClasses.concat([].fill(0,_numDaysTrailing," class=\"darkTD\""));
		for (var _i=1;_i<=_numDaysTrailing;_i++) {
			_dates.push(new Date(_date.getFullYear(),_date.getMonth() + 1,_i));
		}
	}

	var _buffer = "";
	_buffer += "<div class=\"calendarDiv\">\n";
		_buffer += "<form action=\"#\" method=\"get\" onsubmit=\"showDatePicker('" + _elementID + "',new Date($('datePicker_year').value,$('datePicker_month').value,$('datePicker_day').value)); return false;\">\n";
			_buffer += "<input type=\"hidden\" id=\"datePicker_day\" value=\"" + _date.getDate() + "\" />\n";
			_buffer += "<select id=\"datePicker_month\" class=\"formElement\" style=\"width: 100px;\">\n"; // In JS's 0-based format
				for (var _i=0;_i<_monthNames.length;_i++) {
					_buffer += "<option value=\"" + _i + "\"" + ((_date.getMonth() === _i) ? " selected=\"selected\"" : "") + ">" + _monthNames[_i] + "</option>";
				}
			_buffer += "</select>";
			_buffer += "<select id=\"datePicker_year\" class=\"formElement\" style=\"margin: 0 8px; width: 55px;\">\n";
				for (var _i=2004;_i<(new Date()).getFullYear() + 1;_i++) {
					_buffer += "<option value=\"" + _i + "\"" + ((_date.getFullYear() === _i) ? " selected=\"selected\"" : "") + ">" + _i + "</option>";
				}
			_buffer += "</select>";
			_buffer += "<input type=\"submit\" class=\"formBtn\" style=\"padding: 0;\" value=\"GO\" />";
		_buffer += "</form>\n";

		_buffer += "<a href=\"#\" onclick=\"showDatePicker('" + _elementID + "','" + _lastMonthURL + "'); return false;\" class=\"block left\" style=\"margin: 5px 0;\">&lt;&lt; " + _lastMonth + "</a>\n";
		_buffer += "<a href=\"#\" onclick=\"showDatePicker('" + _elementID + "','" + _nextMonthURL + "'); return false;\" class=\"block right\" style=\"margin: 5px 0;\">" + _nextMonth + " &gt;&gt;</a>\n";
		_buffer += "<div class=\"clear\"></div>\n";

		_buffer += "<table cellpadding=\"0\">\n";
			_buffer += "<tr><td>S</td><td>M</td><td>T</td><td>W</td><td>T</td><td>F</td><td>S</td></td>\n";
		_buffer += "</table>\n";

		_buffer += "<table cellpadding=\"0\" class=\"calendarTable\">\n";
			var _l = 0, _dateStr = "";
			for (var _i=0;_i<_numWeeksInThisMonth;_i++) {
				_buffer += "<tr>\n";
					for (var _j=0;_j<7;_j++) {
						_dateStr	= _dates[_l].getDate() + "," + _dates[_l].getMonth() + "," + _dates[_l].getFullYear();
						_buffer		+= "<td" + _daysClasses[_l] + "" + ((_date.valueOf() === _dates[_l].valueOf()) ? " style=\"background-color: #ccaaaa;\"" : "") + "><a href=\"#\" onclick=\"datePickerSetDate('" + _elementID + "'," + _dateStr + "); return false;\">" + _days[_l] + "</a></td>\n";
						_l++;
					}
				_buffer += "</tr>\n";
			}
		_buffer += "</table>\n";
	_buffer += "</div>\n";

	if ($("datePickerDiv") === null) {
		$$("body")[0].appendChild(Builder.node("div",{id: "datePickerDiv",style: "display: none; position: absolute; top: 0; left: 0; zindex: 10;"}));
	}

	$("datePickerDiv").update(_buffer);
	$("datePickerDiv").style.left	= (_offset.x.toString() + "px");
	$("datePickerDiv").style.top	= ((_offset.y + 33).toString() + "px");
	$("datePickerDiv").show();

	document.observe("mousedown",datePickerMouseClick);
};
datePickerMouseClick = function(_event) {
	var _element = Event.element(_event);

	if ((_element.descendantOf("datePickerDiv") === false) && (_element.id !== "datePickerDiv")) {
		datePickerHide();
	}
};
datePickerSetDate = function(_elementID,_day,_month,_year) {
	var _date	= new Date(_year,_month,_day);
	_month		= (_date.getMonth() + 1).toString();
	_day		= _date.getDate().toString();

	$(_elementID).value = ((_month.length === 1) ? ("0" + _month) : _month) + "/" + ((_day.length === 1) ? "0" + _day : _day) + "/" + _date.getFullYear();
	datePickerHide();
};
datePickerHide = function() {
	document.stopObserving("mousedown",datePickerMouseClick);

	//$("datePickerDiv").fade({duration: 0.2});
	$("datePickerDiv").hide();
};

hsvSearchOnSubmit = function() {
	if ($("hsv") !== null) {
		$("hsv").value = (_hSliders.values.toString() + "|" + _sSliders.values.toString() + "|" + _bSliders.values.toString());
	}
};

hSliderOnSlide = function(_val,_leftSliderID,_rightSliderID) {
	_leftSliderID	= (_leftSliderID === undefined)		? "hue1O" : _leftSliderID;
	_rightSliderID	= (_rightSliderID === undefined)	? "hue2O" : _rightSliderID;

	$(_leftSliderID).style.width	= (parseInt((_val[0] * 390) / 360,10) + 1) + "px";
	$(_rightSliderID).style.width	= ((390 - parseInt((_val[1] * 390) / 360,10)) - 1) + "px";
};

sSliderOnSlide = function(_val,_leftSliderID,_rightSliderID) {
	_leftSliderID	= (_leftSliderID === undefined)		? "sat1O" : _leftSliderID;
	_rightSliderID	= (_rightSliderID === undefined)	? "sat2O" : _rightSliderID;

	$(_leftSliderID).style.width	= (parseInt((_val[0] * 390) / 100,10) + 1) + "px";
	$(_rightSliderID).style.width	= ((390 - parseInt((_val[1] * 390) / 100,10)) - 1) + "px";
};

bSliderOnSlide = function(_val,_leftSliderID,_rightSliderID) {
	_leftSliderID	= (_leftSliderID === undefined)		? "bri1O" : _leftSliderID;
	_rightSliderID	= (_rightSliderID === undefined)	? "bri2O" : _rightSliderID;

	$(_leftSliderID).style.width	= (parseInt((_val[0] * 390) / 100,10) + 1) + "px";
	$(_rightSliderID).style.width	= ((390 - parseInt((_val[1] * 390) / 100,10)) - 1) + "px";
};

replyTo = function(_divID,_inputID,_userName) {
	var _value = (_userName.base64_decode() + " wrote:\n<blockquote>" + $(_divID).innerHTML.replace((/<br( \/)?>/gm),"").replace((/<!-- " -->$/gm),"") + "</blockquote>")

	if ($(_inputID).value === "") {
		$(_inputID).value = _value;
	} else {
		$(_inputID).value += ("\n" + _value);
	}

	$(_inputID).focus();
};

confirmRedirect = function(_question,_url) {
	if (confirm(_question)) {
		window.location.href = _url;
		return true;
	}
	return false;
};

rmAvatar = function(_checkStr,_sex) {
	if (confirm("Are you sure you want to delete your Avatar?") === false) {
		return;
	}

	if ((_checkStr !== undefined) && (_checkStr !== null)) {
		var _defaultAvatar;
		switch (_sex) {
			case "f":	_defaultAvatar = "noAvatarFemale";	break;
			case "m":	_defaultAvatar = "noAvatarMale";	break;
			default:	_defaultAvatar = "noAvatarPat";
		}

		(new Image()).src = getImgURL("/lover/" + _defaultAvatar + ".png","_");

		new Ajax.Request("/ajax/rm/avatar/" + _checkStr,{
			onSuccess: function(_transport) {
				if (_transport.responseText === "1") {
					// Fade my other avatars on the screen
					$$(".user-avatar-5504").each(function(_element) {
						if (_element.tagName.toLowerCase() === "img") {
							_element.fade({duration: 0.6});

							new Effect.Tween(_element,1.0,0.0,{duration: 0.6,afterFinish: function() {
								_element.src = getImgURL("/lover/" + this._defaultAvatar + ".png","_");
								_element.show();

								new Effect.Tween(_element,0.0,1.0,{duration: 0.4},function (_value) {
									$(this).setOpacity(_value);
								}.bind(this._element));
							}.bind({_element: _element,_defaultAvatar: _defaultAvatar})},function (_value) {
								$(this).setOpacity(_value);
							}.bind(_element));
						}
					});

					// Fade element I clicked on
					$("avatar-container").childElements().each(function(_element) {
						_element.fade({duration: 0.6});
					});
					(function() {
						$("avatar-container").update("<img src=\"" + getImgURL("/lover/" + this + ".png","_") +  "\" id=\"tmp-user-avatar\" class=\"mt-0\" style=\"display: none;\" alt=\"Avatar\" />");
						$("tmp-user-avatar").setOpacity(0.0);
						$("tmp-user-avatar").appear({duration: 0.4});
					}.bind(_defaultAvatar)).delay(0.6);
				} else {
					alert("Something went wrong! We were not able to remove your Avatar.");
				}
			}
		});
	} else {
		alert("Something went wrong! We were not able to remove your Avatar.");
	}
};

rmPicture = function(_checkStr) {
	if (confirm("Are you sure you want to delete your Picture?") === false) {
		return;
	}

	if ((_checkStr !== undefined) && (_checkStr !== null)) {
		(new Image()).src = getImgURL("/lover/noPicture.jpg","_");

		new Ajax.Request("/ajax/rm/picture/" + _checkStr,{
			onSuccess: function(_transport) {
				if (_transport.responseText === "1") {
					$("picture-container").childElements().each(function(_element) {
						_element.fade({duration: 0.6});
					});
					(function() {
						$("picture-container").update("<img src=\"" + getImgURL("/lover/noPicture.jpg","_") +  "\" id=\"tmp-user-picture\" class=\"mt-0\" style=\"display: none;\" alt=\"Picture\" />");
						$("tmp-user-picture").setOpacity(0.0);
						$("tmp-user-picture").appear({duration: 0.4});
					}).delay(0.6);
				} else {
					alert("Something went wrong! We were not able to remove your Picture.");
				}
			}
		});
	} else {
		alert("Something went wrong! We were not able to remove your Picture.");
	}
};

// http://stackoverflow.com/questions/7477/autosizing-textarea#answer-948445
var AutoResizeTextarea = Class.create({
	initialize: function(_elementID,_minHeight,_maxHeight,_elementWidth) {
		this._textarea		= $(_elementID);
		this._minHeight		= parseInt(_minHeight,10);
		this._maxHeight		= parseInt(_maxHeight,10);
		this._elementWidth	= parseInt(_elementWidth || this._textarea.getWidth(),10);

		this._textarea.observe("keyup",this.refresh.bind(this));
		this._textarea.observe("input",this.refresh.bind(this));
		this._textarea.observe("change",this.refresh.bind(this));
		this._textarea.observe("beforepaste",this.refresh.bind(this));
		this._textarea.observe("blur",this.refresh.bind(this));
		this._textarea.observe("focus",this.refresh.bind(this));

		this._shadow = new Element("div").setStyle({
			lineHeight:		this._textarea.getStyle("lineHeight"),
			fontSize:		this._textarea.getStyle("fontSize"),
			fontFamily:		this._textarea.getStyle("fontFamily"),
			textTransform:	this._textarea.getStyle("textTransform"),
			letterSpacing:	this._textarea.getStyle("letterSpacing"),
			textIndent:		this._textarea.getStyle("textIndent"),
			wordSpacing:	this._textarea.getStyle("wordSpacing"),
			position:		"absolute",
			top:			"-999999em",
			left:			"-999999em",
			width:			(this._elementWidth.toString() + "px")
		});
		this._textarea.insert({after: this._shadow});
		this.refresh();
	},

	refresh: function() {
		this._shadow.update($F(this._textarea).replace((/</gm),"&lt;").replace((/>/gm),"&gt;").replace((/(\r\n|\n|\r)/gm),"<br />") + "&nbsp;");
		var _height						= Math.min(Math.max(parseInt(this._shadow.getHeight(),10),this._minHeight),this._maxHeight);
		this._textarea.style.height		= (_height.toString() + "px")
		this._textarea.style.overflow	= ((_height === this._maxHeight) && (this._maxHeight !== -1)) ? "auto" : "hidden";
	}
});

var Verify = new Class.create({
	initialize: function(_args) {
		this._submitBtnText	= "Please wait ...";
		this._submitBtnID	= "submitBtn";
		this._elements		= [];

		if (_args !== undefined) {
			this._submitBtnText	= _args._submitBtnText;
			this._submitBtnID	= _args._submitBtnID;
		}
	},

	addElement: function(_elementIDs,_verificationArgs) {
		if (Object.isArray(_elementIDs) === false) {
			_elementIDs = [_elementIDs];
		}
		this._elements.push({_elementIDs: _elementIDs,_verificationArgs: _verificationArgs});
	},

	verify: function() {
		var _submitForm = true, _elementID = "", _type = "", _errMsg = "", _msgs = ["Whoops! Looks like we need your help fixing your information.\n---------------------------------------------------------"], _shownDefaultMsg = false;

		for (var _i=0;_i<this._elements.length;_i++) {
			if ((this._elements[_i]._elementIDs !== null) && (this._elements[_i]._elementIDs.length > 0)) {
				_elementID = this._elements[_i]._elementIDs[0];

				if ($(_elementID) === null) {
					alert("'" + _elementID + "' doesn't exist in the DOM");
					return false;
				}
				if (($(_elementID).hasClassName("disabled") === false) && ($(_elementID).disabled === false)) {
					_type = _errMsg = "";

					if (this._elements[_i]._verificationArgs !== undefined) {
						if (this._elements[_i]._verificationArgs._type !== undefined) {
							_type = this._elements[_i]._verificationArgs._type;
						}
						if (this._elements[_i]._verificationArgs._errMsg !== undefined) {
							_errMsg = this._elements[_i]._verificationArgs._errMsg;
						}
					}
					this._elements[_i]._elementIDs.each(function(_field) {
						$(_field).removeClassName("error");
					});

					switch (_type) {
						case "url":
							if ((/^https?:\/\/[\-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[\-a-zA-Z0-9+&@#\/%=~_|]$/).test($(_elementID).value) === false) {
								_submitForm = false;
								$(_elementID).addClassName("error");
								_msgs.push("URL must be valid\nex: http://www.domain.com");
							}
						break;
						case "email":
							if ((/^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,4}|museum)\b$/i).test($(_elementID).value.strip()) === false) { // Used on themeleon reg page, too
								_submitForm = false;
								$(_elementID).addClassName("error");
								_msgs.push("Email Address must be valid\nex: User@Domain.com");
							}
						break;
						case "zip":
							if (($(_elementID).value.strip() === "") || ($(_elementID).value.match(/[0-9]{5}/) === null)) {
								_submitForm = false;
								$(_elementID).addClassName("error");
								_msgs.push("Zip Code must be valid\nex: 97216");
							}
						break;
						case "checked":
							if ($(_elementID).checked === false) {
								_submitForm = false;
								_msgs.push(_errMsg);
							}
						break;
						case "numeric":
							if (isNaN($(_elementID).value) || ($(_elementID).value === "")) {
								_submitForm = false;
								$(_elementID).addClassName("error");
								_msgs.push("Value must be a Number\nex: 1234");
							}
						break;
						case "select":
							if ($(_elementID).options[$(_elementID).selectedIndex].value === "") {
								_submitForm = false;
								$(_elementID).addClassName("error");
								_msgs.push(_errMsg);
							}
						break;
						case "password":
							_badPasswd = false;
							_badPasswd = ($(_elementID).value !== $(this._elements[_i]._elementIDs[1]).value)			? true : _badPasswd; // Are they the same?
							_badPasswd = ($(_elementID).value.length < this._elements[_i]._verificationArgs._minLength)	? true : _badPasswd; // Length?
							_badPasswd = ($(_elementID).value === "")													? true : _badPasswd; // Is it blank?

							if (_badPasswd) {
								_submitForm = false;
								this._elements[_i]._elementIDs.each(function(_field) {
									$(_field).addClassName("error");
								});
								_msgs.push("The passwords you entered are blank, too short or aren't the same");
							} else {
								this._elements[_i]._elementIDs.each(function(_field) {
									$(_elementID).style.border = "";
								});
							}
						break;
						case "userName":
							if (($(_elementID).value.replace((/["#$%&')(,\/:;=>\?<{}[+^`|\]\n\r\t\\]/gm),"") !== $(_elementID).value) || ($(_elementID).value === "")) { // Used on themeleon reg page, too
								$(_elementID).addClassName("error");
								_submitForm = false;
								_msgs.push("Usernames must NOT contain any of the following characters:\n\" # $ % & ' ) ( , / : ; = > ? < { } [ + ^ ` | ] \\\nor any new lines or tabs");
							}
						break;
						case "groupTitle":
							if (($(_elementID).value.match(/[\\><\t\r\n]/g) !== null) || ($(_elementID).value === "")) {
								$(_elementID).addClassName("error");
								_submitForm = false;
								_msgs.push((_errMsg !== "") ? _errMsg : "The Group's Name must NOT contain any of the following characters:\n> < \\ tabs or new line characters\nPlease correct and re-submit.");
							}
						break;
						case "radio":
							var _checkCount = 0;

							for (var _j=0;_j<this._elements[_i]._elementIDs.length;_j++) {
								if ($(this._elements[_i]._elementIDs[_j]).checked) {
									_checkCount++;
								}
							}

							if (_checkCount === 0) {
								_submitForm = false;
								_msgs.push(_errMsg);
							}
						break;
						case "colorHex":
							if (isValidHex($(_elementID).value) === false) {
								$(_elementID).addClassName("error");
								_submitForm = false;
								_msgs.push("Value must be a valid Hex value\nex: FF33CC");
							}						
						break;
						case "flickrID":
							if (($(_elementID).value !== "") && ($(_elementID).value.match(/^\w+?@\w+$/) === null)) {
								$(_elementID).addClassName("error");
								_submitForm = false;
								_msgs.push("Value must be a valid Flickr ID\nex: 41434087@N00");
							}
						break;
						default:
							if ($(_elementID).value === "") {
								_submitForm = false;
								$(_elementID).addClassName("error");
								if (_errMsg !== "") {
									_msgs.push(_errMsg);
								}

								if (_shownDefaultMsg === false) {
									_msgs.push("Please Fill out all required fields. [They now have a red border]");
									_shownDefaultMsg = true;
								}
							}
						break;
					}
				}
			}
		}

		if (_submitForm) {
			var _submitBtn = $(this._submitBtnID);
			if (_submitBtn !== null) {
				_submitBtn.disabled	= true;
				_submitBtn.value	= this._submitBtnText;
			}
		} else {
			alert(_msgs.join("\n\n") + "\n\n---------------------------------------------------------");
		}
		return _submitForm;
	}
});

// html.js
storeCaret = function(_input) {
	if (_input.createTextRange !== undefined) {
		_input._caretPos = document.selection.createRange().duplicate();
	}
};

fmtTxt = function(_commentBoxID,_leftStr,_rightStr,_midStr) {
	_input = $(_commentBoxID);
	_input.focus();
	var _selection;

	if ((_input._caretPos !== undefined) && (_input.createTextRange)) {
		// IE
		var _caretPos	= _input._caretPos;
		_selection		= ((_midStr === "") || (_midStr === undefined)) ? _caretPos.text : _midStr;

		var _length	= _selection.length;
		var _bias	= 0;
		if (_selection.charAt(_selection.length - 1) === " ") {
			// There's a trailing space:
			_caretPos.text	= (_leftStr + _selection.substring(0,(_selection.length - 1)) + _rightStr + " ");
			_bias			= 1;
		} else {
			// No trailing space...
			_caretPos.text = (_leftStr + _selection + _rightStr);
		}

		if (_length === 0) {
			_caretPos.moveStart("character",(_rightStr.length * -1));
			_caretPos.moveEnd("character",(_rightStr.length * -1));
		} else {
			_caretPos.moveStart("character",((_rightStr.length + _length) * -1));
			_caretPos.moveEnd("character",((_rightStr.length + _bias) * -1));
		}
		_caretPos.select();
	} else if (_input.selectionStart !== undefined) {
		// FF
		var _begin = _input.value.substr(0,_input.selectionStart);

		if ((_midStr === "") || (_midStr === undefined)) {
			_selection = _input.value.substr(_input.selectionStart,(_input.selectionEnd - _input.selectionStart));
		} else {
			_selection = _midStr;
		}

		var _end			= _input.value.substr(_input.selectionEnd);
		var _newCursorPos	= _input.selectionStart;
		var _scrollPos		= _input.scrollTop;

		if (_selection.charAt(_selection.length - 1) === " ") {
			// There's a trailing space:
			_selection	= _selection.substring(0,(_selection.length - 1));
			_rightStr	+= " ";
		}
		_input.value = (_begin + _leftStr + _selection + _rightStr + _end);

		if (_input.setSelectionRange) {
			if (_selection.length === 0) {
				_input.setSelectionRange((_newCursorPos + _leftStr.length),(_newCursorPos + _leftStr.length));
			} else {
				_input.setSelectionRange((_newCursorPos + _leftStr.length),(_newCursorPos + _leftStr.length + _selection.length));
			}
			_input.focus();
		}
		_input.scrollTop = _scrollPos;
	} else {
		_input.value += (_leftStr + _rightStr);
		_input.focus();
	}
};

fmtTxtURL = function(_commentBoxID) {
	var _input		= $(_commentBoxID);
	var _insText	= "";

	if ((_input._caretPos !== undefined) && (_input.createTextRange)) {
		_insText = _input._caretPos.text;
	} else if (_input.selectionStart !== undefined) {
		_insText = _input.value.substr(_input.selectionStart,(_input.selectionEnd - _input.selectionStart));
	}

	_url = prompt("Input the destination for this Link","http://");
	if ((_url !== null) && (_url !== "")) {
		_text = prompt("Input the Title of this Link",_insText);

		if ((_url.indexOf("http://") !== 0) && (_url.indexOf("https://") !== 0)) {
			_url = ("http://" + _url);
		}
		if (_text === "") {
			_text = _url;
		}
		if ((_url !== "http://") && (_url !== null) && (_url !== undefined)) {
			fmtTxt(_commentBoxID,"<a href=\"" + _url + "\" target=\"_blank\">","</a>",_text);
		}
	} else {
		_input.focus();
	}
};

fmtTxtImage = function(_commentBoxID) {
	var _input	= $(_commentBoxID);
	var _imgSrc	= "";

	_imgSrc = prompt("Input the link where the image is hosted:","http://");
	if ((_imgSrc !== null) && (_imgSrc !== "")) {
		if ((_imgSrc.indexOf("http://") !== 0) && (_imgSrc.indexOf("https://") !== 0)) {
			_imgSrc = ("http://" + _imgSrc);
		}

		if ((_imgSrc !== "http://") && (_imgSrc !== null) && (_imgSrc !== undefined)) {
			fmtTxt(_commentBoxID,"<img src=\"","\" />",_imgSrc);
		}
	} else {
		_input.focus();
	}
};

fmtTxtUnderline = function(_commentBoxID) {
	// Because nesting 3 sets of quotes in HTML is unpossible:
	fmtTxt(_commentBoxID,"<span style=\"text-decoration: underline;\">","</span>");
};
// /html.js

// Prototypes //
Array.prototype.in_array = function(_needle) {
	for (var _i=0;_i<=this.length;_i++) {
		if (this[_i] === _needle) {
			return true;
		}
	}
	return false;
};

Array.prototype.fill = function(_beginIndex,_end,_value) {
	var _array = [];
	for (var _i=_beginIndex;_i<_end;_i++) {
		_array[_i] = _value;
	}
	return _array;
};

Array.prototype.sum = function() {
	var _sum = 0.0, _length = this.length;

	if (_length === 0) {
		return false;
	}

	for (var _i=0;_i<_length;_i++) {
		if (isNaN(this[_i])) {
			return false;
		}
		_sum += this[_i];
	}
	return _sum;
};

String.prototype.formatNumber = function(_thousandsSeparator,_decimalSeparator) {
	_thousandsSeparator	= ((_thousandsSeparator === undefined)	? "," : _thousandsSeparator);
	_decimalSeparator	= ((_decimalSeparator === undefined)	? "." : _decimalSeparator);

	var _parts		= this.split(_decimalSeparator);
	var _whole		= _parts[0];
	var _decimal	= ((_parts.length > 1) ? (_decimalSeparator + _parts[1]) : "");
	var _regEx		= (/(\d+)(\d{3})/);
	while (_regEx.test(_whole)) {
		_whole = _whole.replace(_regEx,'$1' + _thousandsSeparator + '$2');
	}

	return (_whole + _decimal);
};

String.prototype.stripLowerASCII = function() {
	return this.replace((/([\x00-\x08\x0b-\x0c\x0e-\x19])/g),"");
};

String.prototype.padHex = function() {
	var _str = ("000000".toString() + this.toString());
	return _str.substring((_str.length - 6),_str.length); // THANKS IE!!!!
};

String.prototype.padLeft = function(_padStr,_amount) {
	var _finalPadStr = "", _str = "";
	_amount++;

	for (var _i=0;_i<_amount;_i++) {
		_finalPadStr += _padStr.toString();
	}
	_str = (_finalPadStr + this.toString());
	return _str.substring((_str.length - _amount),_str.length); // THANKS IE!!!!
};

String.prototype.base64_encode = function() {
	var _buffer = "", _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var _char1, _char2, _char3, _enc1, _enc2, _enc3, _enc4, _i = 0;
	var _this = this.utf8_encode();

	while (_i < _this.length) {
		_char1	= _this.charCodeAt(_i++);
		_char2	= _this.charCodeAt(_i++);
		_char3	= _this.charCodeAt(_i++);
		_enc1	= (_char1 >> 2);
		_enc2	= ((_char1 & 3) << 4) | (_char2 >> 4);
		_enc3	= ((_char2 & 15) << 2) | (_char3 >> 6);
		_enc4	= (_char3 & 63);

		if (isNaN(_char2)) {
			_enc3 = _enc4 = 64;
		} else if (isNaN(_char3)) {
			_enc4 = 64;
		}
		_buffer += _keyStr.charAt(_enc1) + _keyStr.charAt(_enc2) + _keyStr.charAt(_enc3) + _keyStr.charAt(_enc4);
	}
	return _buffer;
};

String.prototype.base64_decode = function() {
	var _buffer = "", _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var _char1, _char2, _char3, _enc1, _enc2, _enc3, _enc4, _i = 0;
	var _this = this.replace(/[^A-Za-z0-9\+\/\=]/g,"");

	while (_i < _this.length) {
		_enc1	= _keyStr.indexOf(_this.charAt(_i++));
		_enc2	= _keyStr.indexOf(_this.charAt(_i++));
		_enc3	= _keyStr.indexOf(_this.charAt(_i++));
		_enc4	= _keyStr.indexOf(_this.charAt(_i++));
		_char1	= ((_enc1 << 2) | (_enc2 >> 4));
		_char2	= (((_enc2 & 15) << 4) | (_enc3 >> 2));
		_char3	= (((_enc3 & 3) << 6) | _enc4);
		_buffer	+= String.fromCharCode(_char1);

		if (_enc3 != 64) {
			_buffer += String.fromCharCode(_char2);
		}
		if (_enc4 != 64) {
			_buffer += String.fromCharCode(_char3);
		}
	}
	return _buffer.utf8_decode();
};

String.prototype.utf8_encode = function() {
	var _this = this;//.replace(/\r\n/g,"\n");
	var _buffer = "", _char = "";

	for (var _i=0;_i<_this.length;_i++) {
		_char = _this.charCodeAt(_i);

		if (_char < 128) {
			_buffer += String.fromCharCode(_char);
		} else if ((_char > 127) && (_char < 2048)) {
			_buffer += String.fromCharCode((_char >> 6) | 192);
			_buffer += String.fromCharCode((_char & 63) | 128);
		} else {
			_buffer += String.fromCharCode((_char >> 12) | 224);
			_buffer += String.fromCharCode(((_char >> 6) & 63) | 128);
			_buffer += String.fromCharCode((_char & 63) | 128);
		}
	}
	return _buffer;
};

String.prototype.utf8_decode = function() {
	var _buffer = "", _i = 0, _char1 = 0, _char2 = 0, _char3 = 0, _this = this;

	while (_i < this.length) {
		_char1 = _this.charCodeAt(_i);

		if (_char1 < 128) {
			_buffer += String.fromCharCode(_char1);
			_i++;
		} else if ((_char1 > 191) && (_char1 < 224)) {
			_char2	= _this.charCodeAt(_i + 1);
			_buffer	+= String.fromCharCode(((_char1 & 31) << 6) | (_char2 & 63));
			_i		+= 2;
		} else {
			_char2	= _this.charCodeAt(_i + 1);
			_char3	= _this.charCodeAt(_i + 2);
			_buffer	+= String.fromCharCode(((_char1 & 15) << 12) | ((_char2 & 63) << 6) | (_char3 & 63));
			_i		+= 3;
		}
	}
	return _buffer;
};

// Custom //
addEngine = function() {
	if ((typeof window.sidebar === "object") && (typeof window.sidebar.addSearchEngine === "function")) {
		window.sidebar.addSearchEngine("http://www.colourlovers.com/firefox/COLOURlovers.src",getStaticURL("/firefox/COLOURlovers.png"),"COLOURlovers","COLOURlovers Palette Search");
	} else {
		alert("The Firefox browser is required to install this plugin.");
	}
};

addEngine2 = function() {
	if ((typeof window.sidebar === "object") && (typeof window.sidebar.addSearchEngine === "function")) {
		window.sidebar.addSearchEngine("http://www.colourlovers.com/firefox/COLOURlovers_hex.src",getStaticURL("/firefox/COLOURlovers.png"),"COLOURlovers hex","COLOURlovers Palette HEX Search");
	} else {
		alert("The Firefox browser is required to install this plugin.");
	}
};