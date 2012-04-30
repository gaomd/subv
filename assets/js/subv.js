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

	$(document).on("submit", ".comment-form", function(e) {
		e.preventDefault();
		var id = $(this).attr("action").split("/").pop();
		$.ajax({
			"url": $(this).attr("action"),
			"type": "POST",
			"data": $(this).serialize(),
			"success": function() {
				collapseItem(id);
				$("#item-" + id).removeClass("cached").removeClass("avoid-expand-again");
				setTimeout(function() {
					expandItem(id);
				}, 200);
			}
		});
		var $form = $(this);
		$form.find("input[type='submit']").addClass("disabled");
		$form.find("textarea[name='content']").addClass("disabled");
		setTimeout(function() {
			$form.find("input[type='submit']").removeClass("disabled");
			$form.find("textarea[name='content']").removeClass("disabled");
		}, 5000);
		return false;
	});
	$("#show-read-list").on("click", function() {
		$("#read-list").slideToggle();
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
		}
	});
}

function reloadItemsList() {
	$("#list").html("");
	$("#read-list").hide().html("");
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
				if (item.isRead(list[i].id, list[i].comments_count)) {
					$("#read-list").append(t);
				} else {
					$("#list").append(t);
				}
			}
		}
	});
}

var item = {
	"markRead": function(id, comments) {
		amplify.store("read-"+id+"-"+comments, "true");
	},
	"markUnRead": function(id, comments) {
		amplify.store("read-"+id+"-"+comments, "false");
	},
	"isRead": function(id, comments) {
		if (amplify.store("read-"+id+"-"+comments) === "true") {
			return true;
		}
		return false;
	},
	"markBan": function(id) {
		amplify.store("ban-"+id, "true");
	},
	"markUnban": function(id) {
		amplify.store("ban-"+id, "false");
	},
	"isBan": function(id) {
		if (amplify.store("ban-"+id) === "true") {
			return true;
		}
		return false;
	}
}

