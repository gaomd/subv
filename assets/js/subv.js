/*
 * Subv: //github.com/gdd/subv
 * Copyright (C) 2012 Md Gao
 * Licensed under the MIT License
 */

"use strict";

window.subv = {
	currentPage: -1,
	init: function() {
		window.doT.templateSettings.strip = false;
		subv.bindEvents();
		subv.clearList();
		subv.loadNextList();
	},
	log: function(context) {
		if ( !window.console && !window.console.log ) {
			return false;
		}
		if (typeof context === "object") {
			console.log(context);
		} else {
			console.log("LOG: " + context);
		}
	},
	loadNextList: function() {
		subv.currentPage++;
		var page = subv.currentPage;
		var url;
		if (page === 0) {
			url = "/";
		} else {
			url = "/recent?p=" + page;
		}
		$.ajax({
			"url": "http://www.v2ex.com" + url,
			"success": function(html) {
				var list = parseList(html);
				for (var i = 0; i < list.length; i++) {
					var t = (doT.template($("#item-template").text()))(list[i]);
					if (subv.item.isBanned(list[i].id)) {
						$("#banned").append(t);
					} else if (subv.item.isRead(list[i].id, list[i].comments_count)) {
						$("#read").append(t);
					} else {
						$("#latest").append(t);
					}
				}
			}
		});
	},
	clearList: function() {
		$("#latest").html("");
		$("#read").hide().html("");
		$("#banned").hide().html("");
	},
	refreshList: function() {
		subv.clearList();
		subv.currentPage = -1;
		subv.loadNextList();
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

		$("#mark-all-read").on("click", function() {
			subv.log("#mark-all-read clicked");
			subv.items.markAllAsRead();
		});

		$("#mark-ban-unread").on("click", function() {
			subv.log("#mark-ban-unread clicked");
			subv.items.markAllAsBanned()
		});

		$("#logo, #reload").on("click", function() {
			subv.refreshList();
		});

		$("#more"/* <button/> */).on("click", function() {
			subv.loadNextList();
		});

		$("#show-read-list").on("click", function() {
			$("#read").slideToggle();
		});

		$("#show-banned-list").on("click", function() {
			$("#banned").slideToggle();
		});

		//onsubmit="window.open('https://www.google.com/search?q=site%3Av2ex.com%2Ft+' + document.getElementById('q').value); return false;"

		$(document).on("click", ".item-heading .title a, .item-meta .comments-count a", function(e) {
			var id = $(this).closest(".item").attr("id").split("-")[1];
			subv.log("clicked item id: " + id);
			subv.item.expand(id);
		});

		/* TODO
		$(document).on("click", "#item-collapse", function(e) {
			collapseItem($(this).closest(".item").attr("id").split("-")[1]);
		});
		*/

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

		$("#width-controller").on("change", function() {
			var val = $(this).val();
			$("#items").attr("class", "span" + val);
			$("#item").attr("class", "span" + (12-val));
		}).trigger("change");
	},
};

subv.item.collapse = function(itemId) {
	log("Collapse id: " + itemId);

	var $item = $("[id^=item-" + itemId + "]");
	$item.removeClass("active");
	setTimeout(function() {
		$item.removeClass("avoid-expand-again");
	}, 1000);
}

subv.item.expand = function(itemId) {
	subv.log("expandItem(" + itemId + ")");

	var $item = $("[id^=item-" + itemId + "]");
	// expand item directly if it's expanded once
	if ($item.hasClass("cached")) {
		subv.log("cached, expand directly [DO NOTHING CURRENTLY]");
		return;
	} else {
		subv.log("loading...");
		$item.addClass("cached avoid-expand-again");
	}
	var $commentsContainer = $("#item");
	$commentsContainer.html("").append($item.find(".item-comments").clone());
	$commentsContainer.find(".loading-indicator").html("").append('<h3 class="pagination-right">Loading...</h3>');
	$.ajax({
		"url": "http://www.v2ex.com/t/" + itemId,
		//"url": "http://localhost/" + id,
		"success": function(html) {
			var topic = parseTopic(html);
			subv.log(topic);
			var $page = $commentsContainer.find(".page-" + topic.current_page);
			$page.html("");
			$commentsContainer.addClass("haspage-" + topic.current_page);
			for (var i = 0; i < topic.comments.length; i++) {
				var template = $("#comment-item-template").text();
				var t = ( doT.template(template) )(topic.comments[i]);
				$page.append(t);
			}
			/*
			$commentsContainer.find(".comment-item").eq(0).addClass("comment-item-op");
			$commentsContainer.find(".loading-indicator").html("");
			$commentsContainer.find(".comment-item").eq(0).find(".comment-main").addClass("comment-main-flashlight");
			setTimeout(function() {
				$commentsContainer
					.find(".comment-item").eq(0).find(".comment-main")
					.removeClass("comment-main-flashlight");
			}, 1000);
			*/


			subv.log("marking "+itemId+"-"+topic.comments_count+" as read");
			subv.item.markRead(itemId, topic.comments_count);
		}
	});
}

$(subv.init);
