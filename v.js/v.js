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
	$("<span style=\"font-size: 1.6em; font-family: 'Arial Black'; float: left; line-height: 1.7em;\">V2EX</span>").appendTo("#TopMain > a");
	$("#Rightbar").remove();
	$("#Content").css("margin", "0 0 0 0");
	$("#Content").css("padding", "12px 0 0 0");

	// rip navigations
	$("#Navigation ul li:nth-child(1)").hide(); // index
	$("#Navigation ul li:nth-child(3)").hide(); // workspace
	$("#Navigation ul li:nth-child(4)").hide(); // non-closed <a />
	$("#Navigation ul li:nth-child(5)").hide(); // notepad
	$("#Navigation ul li:nth-child(6)").hide(); // near me

	// refactor the search box
	$("#TopMain #Search > form > div > input").appendTo("#TopMain #Search > form");
	$("#TopMain #Search > form > div").remove();
	$("#TopMain #Search").css("padding-top", "8px"); // default is 6px

	if (window.location.pathname.indexOf("/t/") !== -1) {
		// remove 'By ' from OP
		if (window.location.pathname.indexOf("/t/") !== -1) {
			$("#Content > .box small.fade").html($("#Content > .box small.fade").html().split(/^By /).join(""));
		}

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
		fav.css("margin-right", ".5em");
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
	}
}

