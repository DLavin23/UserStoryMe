var ModalWindow = new Class.create({
	initialize: function(options) {
		this.options = Object.isString(options) ? options.evalJSON(true) : options;

		if ($("cl-modal-window") === null) {
			var body = document.getElementsByTagName("body")[0];
			body.appendChild(Builder.node("div",{id: "cl-modal-window",style: "display: none;"}))
			body.appendChild(Builder.node("div",{id: "cl-modal-window-background",style: "display: none;"}))
		}

		this.isVisible			= false;
		this.modalWindow		= $("cl-modal-window");
		this.modalBackground	= $("cl-modal-window-background");
		this.options.width		= this.options.width	|| 400;
		this.options.body		= this.options.body		|| "";
		this.options.showHr		= this.options.showHr	|| true;
		this.options.btns		= this.options.btns		|| [];
		this.options.btnAlign	= this.options.btnAlign	|| "right";

		this.drawContent(); // preload media content in cache

		Event.observe(window,"resize",function(event) {
			if (this.isVisible) {
				this.show(false);
			}
		}.bind(this));
	},

	drawContent: function() {
		this.modalWindow.style.width = (this.options.width.toString() + "px");

		// Build content
		var content = "";
		if (this.options.body !== "") {
			content += this.options.body;
		}
		if (this.options.showHr) {
			content += "<div class=\"hr\"></div>";
		}
		if (this.options.btns.length !== 0) {
			if (this.options.btnAlign === "right") {
				this.options.btns = this.options.btns.reverse();
			}

			var btn = {}, formID = "", style = "",closeBtnIDs = [], href = "";
			for (var i=0,numBtns=this.options.btns.length;i<numBtns;i++) {
				btn				= this.options.btns[i];
				btn.method		= btn.method		|| "get";
				btn.closeModal	= btn.closeModal	|| false;
				btn.onClick		= btn.onClick		|| "";
				formID			= "";
				style			= "";
				btnID			= "cl-modal-btn-" + i.toString();

				if (btn.method === "post") {
					formID		= "cl-modal-form-" + i.toString();
					content		+= "<form action=\"" + btn.href + "\" method=\"post\" id=\"" + formID + "\" class=\"hidden-form\"></form>";
					btn.onClick	= "if ($('" + formID + "').hasClassName('submitted') === false) { $('" + formID + "').addClassName('submitted'); $('" + formID + "').submit(); } return false;";
				}

				if (btn.closeModal) {
					btn.href	= "#";
					btn.onClick	+= "return false;";
					closeBtnIDs.push(btnID);
				}

				if (this.options.btnAlign === "left") {
					style = " mr-10";
				} else {
					style = " ml-10";
				}

				href = btn.href;
				if (btn.method === "post") {
					href = "#";
				}

				content += "<a href=\"" + href + "\" id=\"" + btnID + "\" class=\"short-modal-pill " + this.options.btnAlign + style + "\"" + ((btn.onClick !== "") ? " onclick=\"" + btn.onClick + "\"" : "") + "><span></span>" + btn.title + "</a>";
			}

			content += "<div class=\"clear\"></div>";
		}

		// Build window
		this.modalWindow.innerHTML = "";

		if (this.options.title !== undefined) {
			this.modalWindow.innerHTML += "<h2>" + this.options.title + "</h2>";
		}
		if (content !== "") {
			this.modalWindow.innerHTML += "<div class=\"modal-content\">" + content + "</div>";
		}

		// Assign events to close btns
		for (var i=0,numCloseBtns=closeBtnIDs.length;i<numCloseBtns;i++) {
			Event.observe(closeBtnIDs[i],"click",this.hide.bind(this));
		}
	},

	show: function(draw) {
		this.isVisible = true;

		if (draw) {
			this.drawContent();
		}

		var dimensions				= this.modalWindow.getDimensions();
		var pageSize				= getPageSize();
		var left					= ((pageSize[0] - dimensions.width) / 2);
		var top						= ((pageSize[3] - dimensions.height) / 2);
		this.modalWindow.style.top	= "100px";
		this.modalWindow.style.left	= (left < 0)	? 0 : left.toString() + "px";
		this.modalWindow.style.top	= (top < 0)		? 0 : top.toString() + "px";

		this.modalBackground.setOpacity(0.6);
		this.modalBackground.show();
		this.modalWindow.show();
	},

	hide: function() {
		this.isVisible = false;

		this.modalBackground.hide();
		this.modalWindow.hide();
	}
});