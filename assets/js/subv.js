/* Copyright (C) 2012 Md Gao
 * MIT /LICENSE
 */

"use strict";

$(function() {
	window.Subv = {
		"current_page": 0
	};
	window.doT.templateSettings.strip = false;
	$(document).on("click", ".item-checker", function() {
		$(this).addClass("item-checker-checked");
		$(this).find("i").attr("class", "icon-ok-sign");
	});
	$(document).on("click", ".title", function(e) {
		e.preventDefault();
		var id = $(this).closest(".item").attr("id").substring(4);
		console.log(id);
		showTopic(id);
	});
	$(document).on("click", "a", function() {
		if ( $(this).hasClass("clickpass") ) {
			return true;
		}
		return false;
	});
	$(document).on("click", ".item", function() {
		var id = $(this).attr("id").substring(4);
		showTopic(id);
	});
	$(document).on("click", "#item-collapse", function() {
		$(this).closest(".item").removeClass("active");
	});
	$("#logo").on("click", function() {
		$("#list").html("");
		appendItems(0);
		return false;
	});

	$("#overlay").on("click", function() {
		hideTopic();
	});
	$("#more").on("click", function() {
		Subv.current_page++;
		appendItems(Subv.current_page);
	});
	appendItems(Subv.current_page);
});

function showTopic(id) {
	if (Subv["clicked" + id] === "true") {
		return;
	} else {
		Subv["clicked" + id] = "true";
	}

	var $item = $("#item" + id);
	var $commentsContainer = $item.find(".item-comments");
	$commentsContainer.html("").append('<h3 class="pagination-right">Loading...</h3>');
	$item.addClass("active");
	$.ajax({
		"url": "http://www.v2ex.com/t/" + id,
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

function appendItems(pageNo) {
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

function rewriteCommon() {
	// there is no sidebar for these in /member/*
	var notifyPath;
	var notifyCount;
	var favPath;
	var favCount;
	if (!(window.location.pathname.indexOf("/member/") === 0)) {
		notifyPath = $("#Rightbar .box:first-child .inner a").attr("href");
		notifyCount = $("#Rightbar .box:first-child .inner a").text().split(' ')[0];
		favPath = $("#Rightbar .box:first-child .cell table:last-child td:nth-child(2) a").attr("href");
		favCount = $("#Rightbar .box:first-child .cell table:last-child td:nth-child(2) a span.bigger").text();
	}
	var memberPath = $("#Navigation ul li:nth-child(2) a").attr("href");

	// higher footer
	$("#Bottom").css({
		"height": $(window).height() / 2,
		"background-color": "transparent"
	});

	// ad should be kept
	$("#Rightbar > .box:last-child")
		.clone()
		.attr("id", "ad")
		.css({
			"position": "absolute",
			"max-width": "272",
			"display": "inline-block"
		})
		.hide()
		.appendTo("body");


	// FINALLY, a nice roll out
	setTimeout(function() {
		// i don't know what im doing... so will fix later
		var currOffset = window.pageYOffset;
		var atLeastScroll = $("#meta-here").offset().top - 20;
		var actualScroll;
		if ((currOffset - atLeastScroll) <= 0) {
			actualScroll = atLeastScroll;
		} else {
			actualScroll = currOffset - atLeastScroll;
		}
		$("body").animate({"scrollTop": actualScroll}, 'slow');
		//$("#o").fadeOut();
		$("body").fadeIn();
	}, 1000);
}

