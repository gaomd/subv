/* Copyright (C) 2012 Md Gao
 * MIT /LICENSE
 */

// for consistency on YQL/XHR
function extractResponseText(o) {
	// TODO how to do type check correctly?
	if (o.responseText !== "undefined") {
		return o.responseText;
	}
}

function stripAvatar(html) {
	// kill avatar img tag
	html = html.replace(/src="[^"]*?v2ex\.com\/avatar\/[^"]*?"/g, "");
	// kill src="/static/..." img and script tag
	html = html.replace(/src="\/static\/[^"]*?"/g, "");
	return html;
}

function extractMeta(html) {
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
	}
	var meta = {
		  "isLoggedIn": false
		, "signIn": {
			  "path": prefix + "/signin"
		}
		, "signUp": {
			  "path": prefix + "/signup"
		}
	}
}

// Parse HTML into Topic JSON
function parseTopic(html) {
	var prefix = "http://www.v2ex.com";
	html = stripAvatar(html);
	var $j = $(html);

	var topic = {};
	topic.current_page = Number($j.find("span.page_current").text());
	if (topic.current_page === 0) {
		topic.current_page = 1;
	}
	var comments = $j.find(".no").closest("table").map(function(i) {
		$this = $(this);
		return {
			"id": ($this.find(".thank_area").attr("id") || "").split("_").pop(),
			"no": ((topic.current_page - 1) * 100 + (i+1)).toString(),
			"content_html": $this.find("td:last-child > .reply_content").html(),
			"time_ago": $this.find("td:last-child > .fade.small").text().split("前").shift() + "前",
			"time_iso": null,
			"user": {
				"id": null,
				"name": $this.find("td:last-child > strong a").text(),
				"path": prefix + $this.find("td:last-child > strong a").attr("href")
			}
		}
	}).get();
	var op = {
		"id": Math.random().toString().substr(3,8), // avoid id collision, normal is 6 length
		"no": 0..toString(),
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
		"views_count": $j.find(".header small.gray").text().trim().replace(/.*?(\d+) 次点击.*/, "$1"),
		"comments_count": Number($j.find("#Main > .box > .cell > .gray").text().split(" ")[0]),
		"last_updated_time_ago": null, // nope
		"pages": 1,
		"current_page": 1,
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
}

// Parse HTML into Items List JSON
function parseList(html) {
	var prefix = "http://www.v2ex.com";
	html = stripAvatar(html);
	var list = $(html).find(".item").map(function() {
		var $this = $(this);

		// possible meta format
		// ["tag", "op", "chars", "views", "time_ago", "last_commentator"]
		// ["tag", "op", "chars", "views", "time_ago"]
		var meta = $this.find(".item_title ~ .small.fade").text().split("•");
		meta.shift();
		meta.shift();
		var charCount = meta[0].trim();
		var viewsCount = meta[1].trim().split(" ")[0];
		var timeAgo = meta[2].trim();

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

