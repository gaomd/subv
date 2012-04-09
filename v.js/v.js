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
	hideReadPosts();
	hookClick();
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
	$.each($("#Content > .box .cell > table > tbody > tr span.bigger a"), function(index, value) {
			if (isClicked($(this).attr("href"))) {
				console.log("removing read post " + $(this).attr("href") + " :: " + $(this).text());
				//console.log($(this));
				$(this).closest(".cell").remove();
			}
		}
	);
}

// HARD CODE EVERYTHING, WTF...
function rewriteContent() {
	$("#TopMain > a").attr("href", "/changes");
	$("#TopMain > a > img").css("margin-left", "0");
	$("#Rightbar").remove();
	$("#Content").css("margin", "0 0 0 0");
	$("#Content").css("padding", "12px 0 0 0");

	// refactor the search box
	$("#TopMain #Search > form > div > input").appendTo("#TopMain #Search > form");
	$("#TopMain #Search > form > div").remove();

	if (window.location.pathname.indexOf("/t/") !== -1) {
		// remove 'By ' from OP
		if (window.location.pathname.indexOf("/t/") !== -1) {
			$("#Content > .box > .cell > small.fade").html($("#Content > .box > .cell > small.fade").html().split(/^By /).join(""));
		}

		// remove everything around the comment box
		if ($("#Content .box form").length) {
			$("#Content .box:last-child .inner").remove();
			$("#Content .box:last-child form .cell:first-child").remove();
		}

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
		fav.css("margin-right", ".5em");
		fav.prependTo("#Content .box:first-child .cell:first-child h1");
	
		favText = $("#Content .box:first-child .inner:last-child .fr");
		if (favText.find("span").text().trim() === "") {
			favText.parent().remove();
		} else {
			favText.text(favText.find("span").text().trim());
		}
	}
}

