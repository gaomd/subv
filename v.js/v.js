/* Copyright (c) 2012 Md Gao
 * MIT /LICENSE
 * Improve my V2EX experience
 */

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
		setTimeout(jQueryReady, 50);
	}
}

function main() {
	console.log($().jquery);
	if (window.location.pathname.indexOf("/changes") !== -1) {
		hideReadPosts();
		hookClick();
	}
	rewriteContent();
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
	$.each($("#Content > .box .cell > table > tbody > tr span.bigger a"), function(index, value) {
			if (isClicked($(this).attr("href"))) {
				console.log("removing read post " + $(this).attr("href") + " :: " + $(this).text());
				//console.log($(this));
				//$(this).closest(".cell").remove();
				$(this).closest(".cell").appendTo("#Content > .box");
			}
		}
	);
}

// HARD CODE EVERYTHING, WTF...
function rewriteContent() {
	$("#TopMain > a").attr("href", "/changes");
	$("#TopMain > a > img").remove();
	$("<span style=\"font-size: 1.6em; font-family: 'Arial Black' arial sans-serif; font-weight: bolder; float: left; line-height: 1.7em;\">V2EX</span>").appendTo("#TopMain > a");
	//$("#Rightbar").remove();
	$("#Content").css("margin", "0 0 0 0");
	$("#Content").css("padding", "12px 0 0 0");

	// rip navigations
	$("#Navigation ul li:nth-child(1)").hide(); // index
	$("#Navigation ul li:nth-child(3)").hide(); // workspace
	$("#Navigation ul li:nth-child(4)").hide(); // non-closed <a />
	$("#Navigation ul li:nth-child(5)").hide(); // notepad
	$("#Navigation ul li:nth-child(6)").hide(); // near me
	// refactor my profile link
	$("#Navigation ul li:nth-child(2) a").text("我");

	// refactor the search box
	$("#TopMain #Search > form > div > input").appendTo("#TopMain #Search > form");
	$("#TopMain #Search > form > div").remove();
	$("#TopMain #Search").css("padding-top", "8px"); // default is 6px

	if (window.location.pathname.indexOf("/t/") !== -1) {
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
		if (window.location.pathname.indexOf("/t/") !== -1) {
			$("#Content > .box small.fade").html($("#Content > .box small.fade").html().split(/^By /).join(""));
		}
		// then move meta info to post content area
		$("#Content > .box:nth-child(1) > .cell > small.fade")
			.prependTo("#Content > .box:nth-child(1) > .inner > .content.topic_content")

		// remove everything around the comment box
		if ($("#Content .box form").length) {
			$("#Content .box:last-child .inner").remove();
			$("#Content .box:last-child form .cell:first-child").remove();
		}

		// refactor the fav button
		var fav = $($("#Content .box:first-child .inner:last-child a").get(0));
		//var fav = $($($("#Content .box:first-child .inner").get(-1)).find("a").get(0));
		if (fav.text() === "加入收藏") {
			fav.html("&#9734;");
		} else {
			fav.html('<span style="color: yellow">&#9733;</span>');
		}
		fav.css("line-height", "1em");
		fav.css("border-radius", "1em");
		fav.css("font-size", "1em");
		fav.css("font-family", "Arial");
		//fav.css("margin-right", ".5em"); since &bullet; got the job
		fav.prependTo("#Content .box:first-child h1");
	
		favText = $("#Content .box:first-child .inner:last-child .fr");
		var favNums;
		if (favText.find("span").text().trim() === "") {
			favNums = "0";
		} else {
			favNums = favText.find("span").text().trim().split(' ')[1];
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
		$("#Content .box h1 a").after(' &bullet; <a href="' + tagPath + '" class="tag-in-title op">' + tagName + '</a> &bullet; ');
	}

	// completely write the header
	$("#TopMain").empty();
	$("#TopMain").empty();
	$("#TopMain").html('\
		<table> \
		<tr><td id="logo-here"></td><td rowspan="2" id="ad-here"></td></tr> \
		<tr><td id="search-here"></td></tr> \
		</table>');
	$("#TopMain #logo-here").append('<a id="new-logo" href="/changes">V2EX</a>');
	$("#TopMain #search-here").append('<form onsubmit="return dispatch();"><input type="text" id="q"></form>');
}

