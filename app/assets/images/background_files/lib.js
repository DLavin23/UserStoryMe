/*
* Easing Equations for Script.aculo.us - http://briancrescimanno.com/demos/easing-demo.html
* @author Brian Crescimanno <brian.crescimanno@gmail.com>
* @version 0.8.1
* @revised November 20, 2008
* @copyright 2008 Brian Crescimanno, all rights reserved
* Released under terms of the BSD License http://www.opensource.org/licenses/bsd-license.php
* The math for these equations was created by Robert Penner http://www.robertpenner.com/profmx
*/
// Quadratic
Effect.Transitions.easeInQuad = function(pos){
return Math.pow(pos,2);
};
Effect.Transitions.easeOutQuad = function(pos){
return -(Math.pow((pos-1),2) -1);
};
Effect.Transitions.easeInOutQuad = function(pos){
if ((pos/=0.5) < 1) { return 0.5*Math.pow(pos,2); }
return -0.5 * ((pos-=2)*pos - 2); 
};
// Cubic
Effect.Transitions.easeInCubic = function(pos){
return Math.pow(pos,3);
};
Effect.Transitions.easeOutCubic = function(pos){
return (Math.pow((pos-1),3) +1);
};
Effect.Transitions.easeInOutCubic = function(pos){
if ((pos/=0.5) < 1) { return 0.5*Math.pow(pos,3); }
return 0.5 * (Math.pow((pos-2),3) + 2);
};
// Quartic
Effect.Transitions.easeInQuart = function(pos){
return Math.pow(pos,4);
};
Effect.Transitions.easeOutQuart = function(pos){
return -(Math.pow((pos-1),4) -1);
};
Effect.Transitions.easeInOutQuart = function(pos){
if ((pos/=0.5) < 1) { return 0.5*Math.pow(pos,4); }
return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2); 
};
// Quintic
Effect.Transitions.easeInQuint = function(pos){
return Math.pow(pos, 5);
};
Effect.Transitions.easeOutQuint = function(pos){
return (Math.pow((pos-1), 5) +1);
};
Effect.Transitions.easeInOutQuint = function(pos){
if ((pos/=0.5) < 1) { return 0.5*Math.pow(pos,5); }
return 0.5 * (Math.pow((pos-2),5) + 2);
};
// Sinusoidal
Effect.Transitions.easeInSine = function(pos){
return -Math.cos(pos * (Math.PI/2)) + 1;
};
Effect.Transitions.easeOutSine = function(pos){
return Math.sin(pos * (Math.PI/2));
};
Effect.Transitions.easeInOutSine = function(pos){
return (-0.5 * (Math.cos(Math.PI*pos) -1));
};
// Exponential
Effect.Transitions.easeInExpo = function(pos){
return (pos==0) ? 0 : Math.pow(2, 10 * (pos - 1));
};
Effect.Transitions.easeOutExpo = function(pos){
return (pos==1) ? 1 : -Math.pow(2, -10 * pos) + 1;
};
Effect.Transitions.easeInOutExpo = function(pos){
if(pos==0) { return 0; }
if(pos==1) { return 1; }
if((pos/=0.5) < 1) { return 0.5 * Math.pow(2,10 * (pos-1)); }
return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
};
// Circular
Effect.Transitions.easeInCirc = function(pos){
return -(Math.sqrt(1 - (pos*pos)) - 1);
};
Effect.Transitions.easeOutCirc = function(pos){
return Math.sqrt(1 - Math.pow((pos-1), 2));
};
Effect.Transitions.easeInOutCirc = function(pos){
if((pos/=0.5) < 1) { return -0.5 * (Math.sqrt(1 - pos*pos) - 1); }
return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
};
// Bounce
Effect.Transitions.easeInBounce = function(pos){
return 1;
};
Effect.Transitions.easeOutBounce = function(pos){
if ((pos) < (1/2.75)) {
return (7.5625*pos*pos);
} else if (pos < (2/2.75)) {
return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
} else if (pos < (2.5/2.75)) {
return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
} else {
return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
}
};
Effect.Transitions.easeInOutBounce = function(pos){
return 1;
};
// Back
Effect.Transitions.easeInBack = function(pos){
var s = 1.70158;	
return (pos)*pos*((s+1)*pos - s);
};
Effect.Transitions.easeOutBack = function(pos){
var s = 1.70158;	
return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
};
Effect.Transitions.easeInOutBack = function(pos){
var s = 1.70158;	
if((pos/=0.5) < 1) { return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s)); }
return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
};
// Elastic
Effect.Transitions.easeInElastic = function(pos){
return 1;
};
Effect.Transitions.easeOutElastic = function(pos){
return 1;
};
Effect.Transitions.easeInOutElastic = function(pos){
return 1;
};
// / Easing
/***************************************** CMW EXTENSIONS *****************************************/
// Fixes: https://prototype.lighthouseapp.com/projects/8886/tickets/1137-elementrelativize-does-not-work-properly
Element.absolutize = function (element) {
element = $(element);
if (Element.getStyle(element,'position') === 'absolute') {
return element;
}
// CMW
var offsetParent = Element.getOffsetParent(element);
// / CMW
var eOffset = element.viewportOffset(),
pOffset = offsetParent.viewportOffset();
var offset = eOffset.relativeTo(pOffset);
var layout = element.getLayout();
element.store('prototype_absolutize_original_styles',{
// CMW
position:element.getStyle('position'),
// / CMW
left:element.getStyle('left'),
top:element.getStyle('top'),
width:element.getStyle('width'),
height:element.getStyle('height')
});
element.setStyle({
position: 'absolute',
top: offset.top + 'px',
left: offset.left + 'px',
width: layout.get('width') + 'px',
height: layout.get('height') + 'px'
});
return element;
};
// ----
var _v = parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE") + 5),10);
Prototype.Browser.IE6 = (Prototype.Browser.IE && (_v === 6));
Prototype.Browser.IE7 = (Prototype.Browser.IE && (_v === 7));
Prototype.Browser.IE8 = (Prototype.Browser.IE && !Prototype.Browser.IE6 && !Prototype.Browser.IE7 && (_v === 8));
Prototype.Browser.IE9 = (Prototype.Browser.IE && !Prototype.Browser.IE6 && !Prototype.Browser.IE7 && !Prototype.Browser.IE8 && (_v === 9));
if (Prototype.Browser.IE) {
Prototype.Browser.IE_Version = 6;
if (Prototype.Browser.IE7) Prototype.Browser.IE_Version = 7;
if (Prototype.Browser.IE8) Prototype.Browser.IE_Version = 8;
if (Prototype.Browser.IE9) Prototype.Browser.IE_Version = 9;
}
// ----
//http://andrewdupont.net/test/prototype/mouse_wheel/
(function() {
function wheel(_event) {
var _delta;
if (_event.wheelDelta) {
_delta = _event.wheelDelta / 120;
} else if (_event.detail) {
_delta = -_event.detail / 3;
}
if (!_delta) {
return;
}
var _customEvent = Event.element(_event).fire("mouse:wheel",{_delta: _delta,_event: _event});
if (_customEvent.stopped) { 
Event.stop(_event);
}
}
document.observe("mousewheel",wheel);
document.observe("DOMMouseScroll",wheel);
})();
// ----
Object.extend(Control.Slider.prototype,{
initialize: function(handle,track,options) {
var slider = this;
if (Object.isArray(handle)) {
this.handles = handle.collect( function(e) { return $(e) });
} else {
this.handles = [$(handle)];
}
this.track   = $(track);
this.options = options || { };
this.axis      = this.options.axis || 'horizontal';
this.increment = this.options.increment || 1;
this.step      = parseInt(this.options.step || '1');
this.range     = this.options.range || $R(0,1);
this.value     = 0; // assure backwards compat
this.values    = this.handles.map( function() { return 0 });
this.spans     = this.options.spans ? this.options.spans.map(function(s){ return $(s) }) : false;
this.options.startSpan = $(this.options.startSpan || null);
this.options.endSpan   = $(this.options.endSpan || null);
this.restricted = this.options.restricted || false;
this.maximum   = this.options.maximum || this.range.end;
this.minimum   = this.options.minimum || this.range.start;
// Will be used to align the handle onto the track, if necessary
this.alignX = parseInt(this.options.alignX || '0');
this.alignY = parseInt(this.options.alignY || '0');
this.trackLength = this.maximumOffset() - this.minimumOffset();
this.handleLength = this.isVertical() ?
(this.handles[0].offsetHeight != 0 ?
this.handles[0].offsetHeight : this.handles[0].style.height.replace(/px$/,"")) :
(this.handles[0].offsetWidth != 0 ? this.handles[0].offsetWidth :
this.handles[0].style.width.replace(/px$/,""));
this.active   = false;
this.dragging = false;
this.disabled = false;
// CMW
this.restrictedOffset	= this.options.restrictedOffset || 0;
this.dir				= 0;
// /CMW
if (this.options.disabled) this.setDisabled();
// Allowed values array
this.allowedValues = this.options.values ? this.options.values.sortBy(Prototype.K) : false;
if (this.allowedValues) {
this.minimum = this.allowedValues.min();
this.maximum = this.allowedValues.max();
}
this.eventMouseDown = this.startDrag.bindAsEventListener(this);
this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
this.eventMouseMove = this.update.bindAsEventListener(this);
// Initialize handles in reverse (make sure first handle is active)
this.handles.each( function(h,i) {
i = slider.handles.length-1-i;
slider.setValue(parseFloat(
(Object.isArray(slider.options.sliderValue) ?
slider.options.sliderValue[i] : slider.options.sliderValue) ||
slider.range.start), i);
h.makePositioned().observe("mousedown", slider.eventMouseDown);
});
this.track.observe("mousedown", this.eventMouseDown);
document.observe("mouseup", this.eventMouseUp);
document.observe("mousemove", this.eventMouseMove);
this.initialized = true;
},
setValue: function(sliderValue, handleIdx){
if (!this.active) {
this.activeHandleIdx = handleIdx || 0;
this.activeHandle    = this.handles[this.activeHandleIdx];
this.updateStyles();
}
handleIdx = handleIdx || this.activeHandleIdx || 0;
// CMW
this.dir = (this.getNearestValue(sliderValue) > this.values[handleIdx]) ? -1 : 1;
if (this.initialized && this.restricted) {
if ((handleIdx > 0) && (sliderValue < (this.values[handleIdx - 1] + (this.restrictedOffset * this.dir))))
sliderValue = this.values[handleIdx - 1] + (this.restrictedOffset * this.dir);
if ((handleIdx < (this.handles.length - 1)) && (sliderValue > (this.values[handleIdx + 1] + (this.restrictedOffset * this.dir))))
sliderValue = this.values[handleIdx + 1] + (this.restrictedOffset * this.dir);
}
// /CMW
sliderValue = this.getNearestValue(sliderValue);
this.values[handleIdx] = sliderValue;
this.value = this.values[0]; // assure backwards compat
this.handles[handleIdx].style[this.isVertical() ? "top" : "left"] = this.translateToPx(sliderValue);
this.drawSpans();
if (!this.dragging || !this.event) this.updateFinished();
}
});
// ----
var _toQueryStringAppendBrackets = true;
Hash.prototype.toQueryString = function() {
function toQueryPair(key,value) {
if (Object.isUndefined(value)) { return key; }
return key + "=" + encodeURIComponent(String.interpret(value));
}
return this.inject([], function(results, pair) {
var key = encodeURIComponent(pair.key), values = pair.value;
if (values && typeof values == 'object') {
if (Object.isArray(values)) {
var queryValues = [],k='';
for (var i = 0, len = values.length, value; i < len; i++) {
value = values[i];
k = key+((_toQueryStringAppendBrackets === true) ? "[]" : ""); // Uses global, dirty... I know :-)
queryValues.push(toQueryPair(k,value));
}
return results.concat(queryValues);
}
} else results.push(toQueryPair(key, values));
return results;
}).join('&');
}