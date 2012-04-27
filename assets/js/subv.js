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

	$(document).on("click", "a", function() {
		if ( $(this).hasClass("clickpass") ) {
			return true;
		}
		return false;
	});

	bindExpandItem();
	bindCollapseItem();

	$("#logo").on("click", function(e) {
		e.preventDefault;
		reloadItemsList();
	});

	// load next page
	$("#more").on("click", function() {
		Subv.current_page++;
		appendItemsList(Subv.current_page);
	});
});

function bindExpandItem() {
	// TODO, click pass on title
	$(document).on("click", ".item .heading .title", function(e) {
		e.preventDefault();
		var id = $(this).closest(".item").attr("id").split("-").pop();
		console.log("Clicked id: " + id);
		expandItem(id);
	});
	$(document).on("click", ".item", function(e) {
		var id = $(this).attr("id").split("-").pop();
		console.log("Clicked id: " + id);
		expandItem(id);
	});
}

function bindCollapseItem() {
	$(document).on("click", "#item-collapse", function(e) {
		collapseItem($(this).closest(".item").attr("id").split("-").pop());
	});
}

function collapseItem(itemId) {
	console.log("Collapse id: " + itemId);

	var $item = $("#item-" + itemId);
	$item.removeClass("active");
	setTimeout(function() {
		$item.removeClass("avoid-expand-again");
	}, 1000);
}

function expandItem(itemId) {
	console.log("expandItem(" + itemId + ")");

	var $item = $("#item-" + itemId);
	// expand item directly if it's expanded once
	if ($item.hasClass("avoid-expand-again")) {
		console.log("avoid-expand-again, detected, return");
		return;
	} else if ($item.hasClass("cached")) {
		console.log("cached, expand directly");
		$item.addClass("active avoid-expand-again");
		return;
	} else {
		console.log("loading...");
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
			$commentsContainer.slideDown();
			var controlBarOffsetY = $commentsContainer.eq(0).offset().top - $commentsContainer.eq(0).closest(".item").offset().top;
			$item.find(".control-bar").css({
				"top": controlBarOffsetY
			});
			$commentsContainer.find(".comment:first-child .main").addClass("op-comment-bg");
			setTimeout(function() {
				$commentsContainer
					.find(".comment:first-child .main")
					.removeClass("op-comment-bg");
			}, 1000);
		}
	});
}

function reloadItemList() {
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
			//console.log(list);
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
		console.log("mark as read " + link);
		recordLinkClick(link);
	});
}


// bind onclick to link.
function hookClick() {
	// .on(...) is not available in older jQ
	$("#list .item .heading .title").click(function() {
		var link = $(this).attr("href");
		console.log("clicked " + link);
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
			console.log("moving read post " + $(this).attr("href") + " :: " + $(this).text());
			$(this).closest(".cell").appendTo("#read-items");
		}
	});
}

