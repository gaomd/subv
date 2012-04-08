
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

function jQueryReady() {
	if ($().jquery.indexOf("1.7") !== -1) {
		main();
	} else {
		console.log("waiting for newer jquery ready");
		setTimeout(jQueryReady, 50);
	}
}

function main() {
	console.log($().jquery);
	hideReadPosts();
	hookClick();
	rewriteContent();
}

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

function hookClick() {
	// .on(...) is not available in older jQ
	$("#Content > .box .cell > table > tbody > tr span.bigger a").click(function() {
		var link = $(this).attr("href");
		console.log("clicked " + link);
		recordLinkClick(link);
	});
}

function rewriteContent() {
	$("#TopMain > a").attr("href", "/changes");
	$("#TopMain > a > img").css("margin-left", "0");
	$("#Rightbar").remove();
	$("#Content").css("margin", "0 0 0 0");
	$("#Content").css("padding", "12px 0 0 0");

	// remove 'By ' from OP
	if (window.location.pathname.indexOf("/t/") !== -1) {
		$("#Content > .box > .cell > small.fade").html($("#Content > .box > .cell > small.fade").html().split(/^By /).join(""));
	}
}

