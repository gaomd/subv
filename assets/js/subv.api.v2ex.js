/*
 * Subv: //github.com/gdd/subv
 * Copyright (C) 2012 Md Gao
 * Licensed under the MIT License
 */

/*global subv:false */

// TODO: rewrite
(function(window) {

"use strict";

window.subv.api = {};
window.subv.api.v2ex = {
	getItems: function(pageNo, callback) {
		var url;
		if (pageNo === 0) {
			url = "/";
		} else {
			url = "/recent?p=" + pageNo;
		}
		$.ajax({
			"url": "http://www.v2ex.com" + url,
			"type": "GET",
			"success": function(html) {
				html = subv.api.v2ex.extractResponse(html);
				var items = subv.api.v2ex.parseItems(html);
				callback(items);
			}
		});
	},
	getItem: function(id, pageNo, callback) {
		var url = "http://www.v2ex.com/t/" + id;
		if (pageNo !== null) {
			url += "?p=" + pageNo;
		}
		$.ajax({
			"url": url,
			"type": "GET",
			"success": function(html) {
				html = subv.api.v2ex.extractResponse(html);
				var item = subv.api.v2ex.parseItem(html);
				item.id = id;
				callback(item);
			}
		});
	},
	extractResponse: function(o) {
		if (o.responseText) {
			return o.responseText;
		}
		return o;
	},

stripAvatar: function(html) {
	// kill avatar img tag
	html = html.replace(/src="[^"]*?v2ex\.com\/avatar\/[^"]*?"/g, "");
	// kill src="/static/..." img and script tag
	html = html.replace(/src="\/static\/[^"]*?"/g, "");
	return html;
},
parseMeta: function(html) {
	var prefix = "http://www.v2ex.com";
	var $j = $(html);
	var meta = {
		  "isLoggedIn": true
		, "my": {
			  "name": ""
			, "path": ""
			, "id": ""
		}
		, "notifications": {
			  "count": 0
			, "path": prefix + "/notifications"
		}
		, "favs": {
			  "count": 0
			, "path": prefix + "/my/topics"
		}
		, "signOut": {
			  "path": prefix + "/logout"
		}
	};
	var meta = {
		  "isLoggedIn": false
		, "signIn": {
			  "path": prefix + "/signin"
		}
		, "signUp": {
			  "path": prefix + "/signup"
		}
	};
},
parseItem: function(html) {
	var prefix = "http://www.v2ex.com";
	html = subv.api.v2ex.stripAvatar(html);
	var $j = $(html);

	var topic = {};
	var current_page = parseInt($j.find("span.page_current").text(), 10);
	if (!current_page) {
		current_page = 1;
	}
	var comments = $j.find(".no").closest("table").map(function(i) {
		var $this = $(this);
		return {
			"id": ($this.find(".thank_area").attr("id") || "").split("_").pop(),
			"no": ((current_page - 1) * 100 + (i+1)).toString(),
			"content_html": $this.find("td:last-child > .reply_content").html(),
			"time_ago": $this.find("td:last-child .fade.small").eq(0).text(),
			"time_iso": null,
			"user": {
				"id": null,
				"name": $this.find("td:last-child > strong a").text(),
				"path": prefix + $this.find("td:last-child > strong a").attr("href")
			}
		};
	}).get();
	var op = {
		"id": Math.random().toString().substr(3,8), // avoid id collision, normal is 6 length
		"no": (0).toString(),
		"content_html": $j.find(".topic_content").html() || "",
		"time_ago": $j.find(".header small.gray").text().split(" at ").pop().split("前").shift() + "前",
		"time_iso": null,
		"user": {
			"id": null,
			"name": $j.find(".header small.gray a").text(),
			"path": prefix + $j.find(".header small.gray a").attr("href")
		}
	};
	comments.unshift(op);
	topic = {
		"id": "0", // TODO
		"path": "/t/0", // TODO
		"title": $j.find(".header h1").text(),
		"views_count": $.trim($j.find(".header small.gray").text()).replace(/.*?(\d+) 次点击.*/, "$1"),
		"comments_count": Number($j.find("#Main > .box > .cell > .gray").text().split(" ")[0]),
		"last_updated_time_ago": null, // nope
		"pages": 1,
		"current_page": current_page,
		"tag": {
			"name": $j.find(".header > a").eq(1).text(),
			"path": prefix + $j.find(".header > a").eq(1).attr("href"),
			"info_html": "<strong>Content</strong>"
		},
		"comments": comments
	};
	topic.pages = Math.floor(topic.comments_count / 100) + 1;
	if (topic.comments[0].content_html === "") {
		topic.comments[0].content_html = "RT: " + topic.title;
	}
	return topic;
},
parseItems: function(html) {
	var prefix = "http://www.v2ex.com";
	html = subv.api.v2ex.stripAvatar(html);
	var list = $(html).find(".item").map(function() {
		var $this = $(this);

		// possible meta format
		// ["tag", "op", "time_ago", "last_commentator"]
		// ["tag", "op", "time_ago"]
		var meta = $this.find(".item_title ~ .small.fade").text().split("•");
		meta.shift();
		meta.shift();
		var viewsCount = ""; // v2ex.com no longer have this shown
		var timeAgo = $.trim(meta[0]);

		return {
			"id": $this.find(".item_title a").attr("href").substring(3).split("#").shift(),
			"path": prefix + $this.find(".item_title a").attr("href"),
			"title": $this.find(".item_title a").text(),
			"views_count": viewsCount,
			"comments_count": $this.find(".count_livid").text() || $this.find(".count_orange").text() || 0,
			"last_updated_time_ago": timeAgo,
			"pages": null, // placeholder
			"current_page": 1, // placeholder
			"tag": {
				"name": $this.find(".node").text(),
				"path": prefix + $this.find(".node").attr("href"),
				"info_html": null
			},

			// comments[0] is op & comments[1] is the last commentator
			"comments": [
				{
					"user": {
						"name": $this.find(".small.fade a").eq(1).text(),
						"path": prefix + $this.find(".small.fade a").eq(1).attr("href")
					}
				},
				{
					"user": {
						"name": $this.find(".small.fade a").eq(2).text(),
						"path": prefix + $this.find(".small.fade a").eq(2).attr("href")
					}
				}
			]
		};
	}).get();
	for (var i = 0; i < list.length; i++) {
		list[i].comment_url = prefix + "/t/" + list[i].id;
	}
	return list;
}

};

})(window);

