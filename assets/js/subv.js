/*
 * Subv: //github.com/gdd/subv
 * Copyright (C) 2012 Md Gao
 * Licensed under the MIT License
 */

"use strict";

var subv = {
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
		console.log("LOG: " + context);
	},
	loadNextList: function() {
		subv.currentPage++;
		var page = subv.currentPage;
		var url;
		if (page === 0) {
			url = "/";
		} else {
			url = "/recent?p=" + pageNo;
		}
		$.ajax({
			"url": "http://www.v2ex.com" + url,
			"success": function(html) {
				var list = parseList(html);
				for (var i = 0; i < list.length; i++) {
					var t = (doT.template($("#item").text()))(list[i]);
					if (subv.item.isBanned(list[i].id)) {
						$("#banned-list").append(t);
					} else if (subv.item.isRead(list[i].id, list[i].comments_count)) {
						$("#read-list").append(t);
					} else {
						$("#list").append(t);
					}
				}
			}
		});
	},
	clearList: function() {
		$("#list").html("");
		$("#read-list").hide().html("");
		$("#banned-list").hide().html("");
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
		}
	},
	items: {
		markAllAsRead: function() {
			$("#list .item").each(function() {
				var id = $(this).attr("id").split("-")[1];
				var comments = $(this).attr("id").split("-")[2];
				subv.item.markRead(id, comments);
			});
			subv.refreshList();
		},
		markAllAsBanned: function() {
			$("#list .item").each(function() {
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
			$("#read-list").slideToggle();
		});

		$("#show-banned-list").on("click", function() {
			$("#banned-list").slideToggle();
		});

		//onsubmit="window.open('https://www.google.com/search?q=site%3Av2ex.com%2Ft+' + document.getElementById('q').value); return false;"

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
	},
};

$(subv.init);

function bindExpandItem() {
	// TODO, click pass on title
	$(document).on("click", ".item .heading .title", function(e) {
		e.preventDefault();
		var id = $(this).closest(".item").attr("id").split("-")[1];
		log("Clicked id: " + id);
		expandItem(id);
	});
	$(document).on("click", ".item", function(e) {
		var id = $(this).attr("id").split("-")[1];
		log("Clicked id: " + id);
		expandItem(id);
	});
}

function bindCollapseItem() {
	$(document).on("click", "#item-collapse", function(e) {
		collapseItem($(this).closest(".item").attr("id").split("-")[1]);
	});
}

function collapseItem(itemId) {
	log("Collapse id: " + itemId);

	var $item = $("[id^=item-" + itemId + "]");
	$item.removeClass("active");
	setTimeout(function() {
		$item.removeClass("avoid-expand-again");
	}, 1000);
}

function expandItem(itemId) {
	log("expandItem(" + itemId + ")");

	var $item = $("[id^=item-" + itemId + "]");
	// expand item directly if it's expanded once
	if ($item.hasClass("avoid-expand-again")) {
		log("avoid-expand-again, detected, return");
		return;
	} else if ($item.hasClass("cached")) {
		log("cached, expand directly");
		$item.addClass("active avoid-expand-again");
		return;
	} else {
		log("loading...");
		$item.addClass("cached avoid-expand-again");
	}
	var $commentsContainer = $item.find(".item-comments");
	$commentsContainer.find(".loading-indicator").html("").append('<h3 class="pagination-right">Loading...</h3>');
	$item.addClass("active");
	$.ajax({
		"url": "http://www.v2ex.com/t/" + itemId,
		//"url": "http://localhost/" + id,
		"success": function(html) {
			var topic = parseTopic(html);
			console.log(topic);
			var $page = $commentsContainer.find(".page-" + topic.current_page);
			$page.html("");
			$commentsContainer.addClass("haspage-" + topic.current_page);
			for (var i = 0; i < topic.comments.length; i++) {
				var template = $("#comment-item").text();
				var t = ( doT.template(template) )(topic.comments[i]);
				$page.append(t);
			}
			$commentsContainer.find(".comment-item").eq(0).addClass("comment-item-op");
			$commentsContainer.find(".loading-indicator").html("");
			$commentsContainer.slideDown();
			var controlBarOffsetY = $commentsContainer.eq(0).offset().top - $commentsContainer.eq(0).closest(".item").offset().top;
			$item.find(".control-bar").css({
				"top": controlBarOffsetY
			});
			$commentsContainer.find(".comment-item").eq(0).find(".comment-main").addClass("comment-main-flashlight");
			setTimeout(function() {
				$commentsContainer
					.find(".comment-item").eq(0).find(".comment-main")
					.removeClass("comment-main-flashlight");
			}, 1000);


			log("marking "+itemId+"-"+topic.comments_count+" as read");
			item.markRead(itemId, topic.comments_count);

			var $item2 = $item.clone();
			$("#item-view").html("").append($item2);
			$item.removeClass("active avoid-expand-again");
			$("#item-view").css({
				"padding-top": $item.offset().top - $("#item-view").offset().top
			});
			$item2.removeClass("btn");
		}
	});
}

