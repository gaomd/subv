/*
 * Subv: //github.com/gdd/subv
 * Copyright (C) 2012 Md Gao
 * Licensed under the MIT License
 */

"use strict";

window.subv = {
	currentPage: -1,
	settings: {
		expandMode: "outline", // inline, outline, stacked
	},
	init: function() {
		window.doT.templateSettings.strip = false;
		subv.settings.expandMode = "outline";
		subv.bindEvents();
		subv.clearList();
		subv.loadNextList();
		subv.applySettings();
	},
	log: function(context) {
		if ( !window.console || !window.console.log ) {
			return false;
		}
		if (typeof context === "object") {
			console.log(context);
		} else {
			console.log("LOG: " + context);
		}
	},
	applySettings: function() {
		var val;
		val = amplify.store("width-splitter-value") || $("#width-splitter").val();
		if (val) {
			$("#width-splitter").val(val).trigger("change");
		}
		val = amplify.store("width-adjuster-value") || $("#width-adjuster").val();
		if (val) {
			$("#width-adjuster").val(val).trigger("change");
		}
	},
	loadNextList: function() {
		subv.currentPage++;
		subv.api.v2ex.getItems(subv.currentPage, function(items) {
			for (var i = 0; i < items.length; i++) {
				var t = (doT.template($("#item-template").text()))(items[i]);
				if (subv.item.isBanned(items[i].id)) {
					$("#banned").append(t);
				} else if (subv.item.isRead(items[i].id, items[i].comments_count)) {
					$("#read").append(t);
				} else {
					$("#latest").append(t);
				}
			}
			// update the #read/#banned counter
			$("#read-items-counter").text($("#read > .item").length);
			$("#banned-items-counter").text($("#banned > .item").length);
		});
	},
	clearList: function() {
		$("#latest").html("");
		$("#read").hide().html("");
		$("#banned").hide().html("");
		$("#item").html("");
	},
	refreshList: function() {
		subv.clearList();
		subv.currentPage = -1;
		subv.loadNextList();
		// scroll to top
		$("html, body").animate({
			"scrollTop": 0
		});
	},
	item: {
		markRead: function(id, comments) {
				amplify.store("read-"+id+"-"+comments, "true");
		},
		markUnRead: function(id, comments) {
				amplify.store("read-"+id+"-"+comments, "false");
		},
		isRead: function(id, comments) {
				if (amplify.store("read-"+id+"-"+comments) === "true") {
						return true;
				}
				return false;
		},
		markBan: function(id) {
				amplify.store("ban-"+id, "true");
		},
		markUnban: function(id) {
				amplify.store("ban-"+id, "false");
		},
		isBanned: function(id) {
				if (amplify.store("ban-"+id) === "true") {
						return true;
				}
				return false;
		},
		expand: function(id) {
			subv.log("subv.item.expand(" + id + ")");

			var $item = $("[id^=item-" + id + "-]");
			var $itemx;
			if (subv.settings.expandMode === "inline" &&
					$item.hasClass("cached")) {
				$item.addClass("inline expanded");
				return;
			}
			if (subv.settings.expandMode === "inline") {
				$itemx = $item;
			} else if (subv.settings.expandMode === "outline" ||
					subv.settings.expandMode === "stacked") {
				$itemx = $("<div/>").addClass("item");
				$itemx.append($item.find(".item-heading").clone());
			}
			if (subv.settings.expandMode !== "inline") {
				if (subv.settings.expandMode === "outline") {
					$("#item").empty().append($itemx);
				} else if (subv.settings.expandMode === "stacked") {
					$("#item").append($itemx);
				}
			}
			if (subv.settings.expandMode === "outline") {
				$("html, body").animate({
					"scrollTop": $itemx.offset().top
				});
			}

			$(".item.outline.expanded").removeClass("outline expanded");
			$(".item.outline.expanded").removeClass(".stacked.expanded");
			$item.addClass("expanding cached").addClass(subv.settings.expandMode);
			$itemx.addClass("expanding");

			var template = doT.template( $("#item-comments-template").text() );
			var $comments = $( template({ "id": id}) );
			$itemx.append($comments);
	
			subv.api.v2ex.getItem(id, null, function(item) {
				subv.log(item);
				// op
				var $op = $comments.find(".op");
				var template = doT.template( $("#comment-item-template").text() );
				$op.append( template(item.comments[0]) );
				// comments
				for (var i = 1; i <= item.pages; i++) {
					$comments.addClass("haspage-" + i);
				}
				var $page = $comments.find(".page-" + item.current_page).empty();
				for (var i = 1; i < item.comments.length; i++) {
					var template = doT.template( $("#comment-item-template").text() );
					$page.append( template(item.comments[i]) );
				}
				$item.removeClass("expanding").addClass("expanded");
				$itemx.removeClass("expanding").addClass("expanded");
				subv.item.markRead(id, item.comments_count);
			});
		},
		collapse: function(id) {
		}
	},
	items: {
		markAllAsRead: function() {
			$("#latest .item").each(function() {
				var id = $(this).attr("id").split("-")[1];
				var comments = $(this).attr("id").split("-")[2];
				subv.item.markRead(id, comments);
			});
			subv.refreshList();
		},
		markAllAsBanned: function() {
			$("#latest .item").each(function() {
				var id = $(this).attr("id").split("-")[1];
				var comments = $(this).attr("id").split("-")[2];
				if (!item.isRead(id, comments)) {
					subv.log("Banning " + id);
					subv.item.markBan(id);
				}
			});
			subv.refreshList();
		}
	},
	bindEvents: function() {
		$(document).on("click", "a", function(e) {
			e.preventDefault();
		});

		$("#btn-read-all").on("click", function() {
			subv.items.markAllAsRead();
		});

		$("#btn-ban-all").on("click", function() {
			subv.items.markAllAsBanned()
		});

		$("#logo, #btn-reload").on("click", function() {
			subv.refreshList();
		});

		$("#more"/* <button/> */).on("click", function() {
			subv.loadNextList();
		});

		$("#read-items-toggle").on("click", function() {
			$("#read").slideToggle();
		});

		$("#banned-items-toggle").on("click", function() {
			$("#banned").slideToggle();
		});

		/* unused
		$("#search-form").on("submit", function(e) {
			e.preventDefault();
			var url = "https://www.google.com/search?q=site%3Av2ex.com%2Ft+";
			var keywords = $(this).find("input").val();
			window.open(url + keywords)
		});
		*/

		$(document).on("click", ".item-heading .title a, .item-meta .comments-count a", function(e) {
			var id = $(this).closest(".item").attr("id").split("-")[1];
			subv.log("clicked item id: " + id);
			subv.item.expand(id);
		});

		$(document).on("submit", ".comment-form", function(e) {
			e.preventDefault();
			var id = $(this).attr("action").split("/").pop();
			subv.log("COMMENT FUNCTION DISABLED");
			return false;
			$.ajax({
				"url": $(this).attr("action"),
				"type": "POST",
				"data": $(this).serialize(),
				"success": function() {
					subv.log("POST to " + id + " success!");
				}
			});
		});

		$("#btn-set-mode-inline").on("click", function() {
			subv.log("true");
			subv.settings.expandMode = "inline";
		});

		$("#btn-set-mode-outline").on("click", function() {
			subv.log("true");
			subv.settings.expandMode = "outline";
		});

		$("#btn-set-mode-stacked").on("click", function() {
			subv.log("true");
			subv.settings.expandMode = "stacked";
		});

		$("#width-splitter").on("change", function() {
			var val = $(this).val();
			amplify.store("width-splitter-value", val);
			var witem = 100-val;
			if (witem === 0) {
				witem = 100;
			}
			$("#items").css({
				"width": val + "%"
			});
			$("#item").css({
				"width": witem + "%"
			});
		});

		$("#width-adjuster").on("change", function() {
			var val = $(this).val();
			amplify.store("width-adjuster-value", val);
			setTimeout(function() {
				$("#wrapper").css({
					"margin-left": val+"%",
					"margin-right": val+"%"
				});
			}, 1000);
		});

		$(document).on("click", ".js-show-comment-box", function() {
			$(this).next().show();
			$(this).remove();
		});

		$(document).on("click", ".js-load-page", function() {
			var page = $(this).parent().attr("class").split("-").pop();
			subv.log("loading page " + page);
		});

		$(document).on("click", ".goto-item button", function() {
			subv.log("goto clicked");
			var id = $(this).parent().attr("id").split("-").pop();
			var $item = $("[id^=item-" + id + "]");
			$("html, body").animate({
				"scrollTop": $item.offset().top
			});
		});

	},
};

$(subv.init);

