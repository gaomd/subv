/* Copyright (C) 2012 Md Gao
 * MIT /LICENSE
 * Improve my V2EX experience
 */

"use strict";

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

$(document).ready(function () {
	console.log("starting v.js...");
	/* use native jQuery for maximum performance on initial tasks
	$.getScript("//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js", function() {
		jQueryReady();
	});*/
	main();
});

// waiting for the newer jquery to be ready
function jQueryReady() {
	if ($().jquery.indexOf("1.7") !== -1) {
		main();
	} else {
		console.log("waiting for the newer jquery to be ready");
		setTimeout(jQueryReady, 10);
	}
}

function main() {
	console.log($().jquery);
	$("html").attr("xmlns", "http://www.w3.org/1999/xhtml");
	if (window.location.pathname === "/") {
		document.body.innerHTML = '<h1>&nbsp;&nbsp;redirecting to <a href="/changes">/changes</a>';
		window.location.pathname = "/changes";
		return;
	}

	// hide the restructure detail
	$("body").hide();
	$('<div id="o"></div>').css({
		"height": "100%",
		"background-color": "#EEE",
		"position": "fixed",
		"top": "0px",
		"left": "0px",
		"width": "100%",
		"z-index": "8888",
		"display": "none"
	}).appendTo("body");//.show();

	if (window.location.pathname.indexOf("/changes") !== -1) {
		hideReadPosts();
		hookClick();
		rewritePostsList();
	}
	rewriteCommon();
	if (window.location.pathname.indexOf("/t/") !== -1) {
		rewritePost();
	}
}

function markAllAsRead() {
	$("#Content > .box .cell > table > tbody > tr span.bigger a").map(function() {
		var link = $(this).attr("href");
		console.log("mark as read " + link);
		recordLinkClick(link);
	});
}


// record post click on index, so we can hide read posts.
function hookClick() {
	// .on(...) is not available in older jQ
	$("#Content > .box .cell > table > tbody > tr span.bigger a").click(function() {
		var link = $(this).attr("href");
		console.log("clicked " + link);
		recordLinkClick(link);
	});
}

// now hide
function hideReadPosts() {
	$('<div class="sep20"></div>').appendTo("#Content > .box");
	$("#Content > .box .cell > table > tbody > tr span.bigger a").map(function() {
		if (isClicked($(this).attr("href"))) {
			console.log("moving read post " + $(this).attr("href") + " :: " + $(this).text());
			$(this).closest(".cell").appendTo("#Content > .box");
		}
	});
}

function rewriteCommon() {
	// completely write the header
	
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

	$("#TopMain").html('<div> <div id="logo-here"></div> <div id="meta-here"></div> </div>');
	$("#TopMain #logo-here").append('<a id="new-logo" href="/changes">V2EX</a>');
	$("#TopMain #meta-here")
		.append('<a href="' + memberPath + '" class="top">我</a>')
		.append(' • ');
	if (!(window.location.pathname.indexOf("/member/") === 0)) {
		$("#TopMain #meta-here")
			.append('<a href="' + notifyPath + '" class="top">消息' + (notifyCount === "0" ? "" : '（' + notifyCount + '）') + '</a>')
			.append(' • ')
			.append('<a href="' + favPath + '" class="top">收藏' + (favCount === "0" ? "" : '（' + favCount + '）') + '</a>')
			.append(' • ');
	}
	$("#TopMain #meta-here")
		.append('<a href="/settings" class="top">设置</a>')
		.append(' • ')
		.append('<a href="/signout" class="top">登出</a>')
		.append(' • ')
		.append('搜索：<form onsubmit="return dispatch();"><input type="text" id="q"></form>');

	// use native background-image
	$("body").css("background-image", $("#Wrapper").css("background-image"));
	$("#Wrapper").css("background-image", "none").css("background-color", "transparent");

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


	var timerId;
	$("#reply_content").closest(".box").hover(function() {
		var y = $("#reply_content").offset().top;
		var x = $("#reply_content").offset().left + $("#reply_content").outerWidth() + 32;

		$("#ad").css({
			"top": y,
			"left": x
		}).fadeIn('slow').hover(function() {
				clearTimeout(timerId);
			}, function() {
				$("#ad").fadeOut();
			});
	}, function() {
		timerId = setTimeout(function() {
			$("#ad").fadeOut();
		}, 800);
	});

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

function rewritePost() {
	// FIX the OP structure
	if ($("#Content > .box:first-child > .cell").length === 0) {
		$("#Content > .box:first-child > .inner:first-child").addClass("cell").removeClass("inner");
		var div = document.createElement("div");
		div.className = "inner";
		var div2 = document.createElement("div");
		div2.className = "content topic_content";
		div2.innerText = "/dev/null";
		div.appendChild(div2);
		$("#Content > .box:first-child > .cell:first-child").after(div);
	}

	// remove 'By ' from OP
	$("#Content > .box small.fade").html($("#Content > .box small.fade").html().split(/^By /).join(""));
	// then move meta info to post content area
	$("#Content > .box:nth-child(1) > .cell > small.fade")
		.prependTo("#Content > .box:nth-child(1) > .inner > .content.topic_content");

	// refactor the fav button
	var fav = $($("#Content .box:first-child .inner:last-child a").get(0));
	if (fav.text() === "加入收藏") {
		fav.html("&#9734;");
	} else {
		fav.html('<span style="color: yellow">&#9733;</span>');
	}
	fav.css("line-height", "1em");
	fav.css("border-radius", "1em");
	fav.css("font-size", "1em");
	fav.css("font-family", "Arial");
	fav.prependTo("#Content .box:first-child h1");

	var favText = $("#Content .box:first-child .inner:last-child .fr");
	var favNums;
	if ($.trim(favText.find("span").text()) === "") {
		favNums = "0";
	} else {
		favNums = $.trim(favText.find("span").text()).split(' ')[1];
	}
	favText.parent().remove();
	if (favNums !== "0") {
		$("#Content .box:first-child h1 a").append(favNums);
	}

	// now refactor tag
	var tagPath = $("#Content .box span.bigger a:last-child").attr("href");
	var tagName = $("#Content .box span.bigger a:last-child").text();
	$("#Content .box span.bigger").remove(); // not needed anymore
	$("#Content .box h1").css("padding", "0");
	$("#Content .box h1").parent().css("min-height", "0");
	// TODO: not robust
	$("#Content .box h1 a").after(' • <a href="' + tagPath + '" class="tag-in-title op">' + tagName + '</a> • ');
	// prepare the tag-details
	var tagDetails;
	if ($("#Rightbar > .box").length <= 2) {
		tagDetails = $('<div class="box" id="tag-details"><div class="inner"><strong>nothing</strong></div></div>');
	} else {
		tagDetails = $("#Rightbar > .box").eq(1).clone().attr("id", "tag-details");
	}
	tagDetails.appendTo("body");
	$("#tag-details").css({
		"display": "none",
		"position": "absolute",
		"border": "2px solid #dde",
		"border-radius": ".5em",
		"min-width": "256px",
		"min-height": "32px",
		"max-width": "480px",
		"box-shadow": "rgb(85, 87, 83) 0px 16px 32px"
	});
	$("#tag-details").attr("style", 'background-color: white !important; ' + $("#tag-details").attr("style"));
	$("#tag-details > .inner").css({ "background-color": "transparent" });

	var timerId;
	$(".tag-in-title").hover(function() {
		var y = $(".tag-in-title").outerHeight() + $(".tag-in-title").offset().top + 2;
		var x = $(".tag-in-title").offset().left;
		$("#tag-details").css({
			"top": y,
			"left": x
		}).fadeIn().hover(function() {
				clearTimeout(timerId);
			}, function() {
				$("#tag-details").fadeOut();
			});
	}, function() {
		timerId = setTimeout(function() {
			$("#tag-details").fadeOut();
		}, 400);
	});

	// remove everything around the comment box
	if ($("#Content .box form").length) {
		$("#Content .box:last-child .inner").remove();
		$("#Content .box:last-child form .cell:first-child").remove();
	}

	// refactor comments
	// FIX the last comment
	$("#replies > .inner").addClass("cell").removeClass("inner");
	$("#replies .cell td:last-child").map(function() {
		//console.log(this);
		$(this).find("> div.fr img")
			.insertBefore($(this).find("> strong"))
			.css("width", "12px")
			.css("margin-right", ".2em")
			.css("opacity", ".4")
			.css("-webkit-transform", "rotate(222deg)")
			.hover(function() {
				$(this).css("opacity", "1");
			}, function() {
				$(this).css("opacity", ".4");
			});
			//.css("-webkit-transform", "scaleY(-1) rotate(30deg)");
		$(this).find("> div.fr")
			.removeClass("fr")
			.css("display", "inline")
			.insertBefore($(this).find("> div.sep5"));
		//console.log($(this).find("> div.fr"));
	});
}

function rewritePostsList() {
}
