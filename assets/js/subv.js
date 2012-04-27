/*
 * Subv: //github.com/gdd/subv
 * Copyright (C) 2012 Md Gao
 * Licensed under the MIT License
 */

"use strict";

$(function() {
	window.Subv = {
		"current_page": 0
	};
	window.doT.templateSettings.strip = false;
	// load page 0
	appendItemsList(Subv.current_page);

	$(document).on("click", "a", function(e) {
		e.preventDefault();
	});

	bindExpandItem();
	bindCollapseItem();

	$("#logo, #reload").on("click", function(e) {
		e.preventDefault;
		reloadItemsList();
	});

	// load next page
	$("#more").on("click", function() {
		Subv.current_page++;
		appendItemsList(Subv.current_page);
	});
});

function log(info) {
	console.log("LOG: " + info);
}

function bindExpandItem() {
	// TODO, click pass on title
	$(document).on("click", ".item .heading .title", function(e) {
		e.preventDefault();
		var id = $(this).closest(".item").attr("id").split("-").pop();
		log("Clicked id: " + id);
		expandItem(id);
	});
	$(document).on("click", ".item", function(e) {
		var id = $(this).attr("id").split("-").pop();
		log("Clicked id: " + id);
		expandItem(id);
	});
}

function bindCollapseItem() {
	$(document).on("click", "#item-collapse", function(e) {
		collapseItem($(this).closest(".item").attr("id").split("-").pop());
	});
}

function collapseItem(itemId) {
	log("Collapse id: " + itemId);

	var $item = $("#item-" + itemId);
	$item.removeClass("active");
	setTimeout(function() {
		$item.removeClass("avoid-expand-again");
	}, 1000);
}

function expandItem(itemId) {
	log("expandItem(" + itemId + ")");

	var $item = $("#item-" + itemId);
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
	$commentsContainer.html("").append('<h3 class="pagination-right">Loading...</h3>');
	$item.addClass("active");
	$.ajax({
		"url": "http://www.v2ex.com/t/" + itemId,
		//"url": "http://localhost/" + id,
		"success": function(html) {
			var topic = parseTopic(html);
			$commentsContainer.html("");
			for (var i = 0; i < topic.comments.length; i++) {
				var template = $("#comment-item").text();
				var t = ( doT.template(template) )(topic.comments[i]);
				$commentsContainer.append(t);
			}
			$commentsContainer.find(".comment-item").eq(0).addClass("comment-item-op");
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
		}
	});
}

function reloadItemsList() {
	$("#list").html("");
	Subv.current_page = 0;
	appendItemsList(0);
}

function appendItemsList(pageNo) {
	var url;
	if (pageNo === 0) {
		url = "/";
	} else {
		url = "/recent?p=" + pageNo;
	}
	$.ajax({
		"url": "http://www.v2ex.com" + url,
		//"url": "http://localhost/recent_" + pageNo,
		"success": function(html) {
			var list = parseList(html);
			//log(list);
			for (var i = 0; i < list.length; i++) {
				var t = (doT.template($("#item").text()))(list[i]);
				$("#list").append(t);
			}
		}
	});
}

function recordLinkClick(link) {
	localStorage[link] = "true";
}

function isClicked(link) {
	if (localStorage[link] === "true") {
		return true;
	} else {
		return false;
	}
}

function markAllAsRead() {
	$("#list .item .heading .title").map(function() {
		var link = $(this).attr("href");
		log("mark as read " + link);
		recordLinkClick(link);
	});
}


// bind onclick to link.
function hookClick() {
	// .on(...) is not available in older jQ
	$("#list .item .heading .title").click(function() {
		var link = $(this).attr("href");
		log("clicked " + link);
		recordLinkClick(link);
	});
}

// now hide
function hideReadPosts() {
	$("#Content > .box")
		.append('<div id="read-items-desc"><h1>Read Items:</h1><button id="show-read-items">show</button></div>')
		.append('<div id="read-items"></div>');
	$("#show-read-items").click(function() {
		$("#read-items").slideDown();
		$(this).remove();
	});

	$("#Content > .box .cell > table > tbody > tr span.bigger a").map(function() {
		if (isClicked($(this).attr("href"))) {
			log("moving read post " + $(this).attr("href") + " :: " + $(this).text());
			$(this).closest(".cell").appendTo("#read-items");
		}
	});
}

