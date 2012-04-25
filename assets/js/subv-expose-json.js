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
	var $j = $(html);
	var comments = $j.find(".no").closest("table").map(function() {
		$this = $(this);
		return {
			"id": ($this.find(".thank_area").attr("id") || "").split("_").pop(),
			"contentHtml": $this.find("td:last-child > .reply_content").html(),
			"timeAgo": $this.find("td:last-child > .fade.small").text(),
			"timeIso": null,
			"user": {
				"id": null,
				"name": $this.find("td:last-child > strong a").text(),
				"path": prefix + $this.find("td:last-child > strong a").attr("href")
			}
		}
	}).get();
	var op = {
		"id": "0", // NOPE
		"contentHtml": $j.find(".topic_content").html() || "RT",
		"timeAgo": $j.find(".header small.gray").text().split(" at ").pop().split("前").shift() + "前",
		"timeIso": null,
		"user": {
			"id": null,
			"name": $j.find(".header small.gray a").text(),
			"path": prefix + $j.find(".header small.gray a").attr("href")
		}
	};
	comments.unshift(op);
	var topic = {
		"tag": {
			"name": $j.find(".header > a").eq(1).text(),
			"path": prefix + $j.find(".header > a").eq(1).attr("href"),
			"infoHtml": "<strong>Content</strong>"
		},

		"topic": {
			"id": "0", // TODO
			"path": "/t/0", // TODO
			"title": $j.find(".header h1").text(),
			"views": "0", // TODO
			"comments": comments.length - 1,
			"created": null
		},

		"comments": comments
	};
	return topic;
}

// Parse HTML into Items List JSON
function parseList(html) {
	var prefix = "http://www.v2ex.com";
	return $(html).find(".item").map(function() {
		var $this = $(this);
		return {
			"tag": {
				"name": $this.find(".node").text(),
				"path": prefix + $this.find(".node").attr("href"),
				"infoHtml": null
			},

			"topic": {
				"id": $this.find(".item_title a").attr("href").substring(3).split("#").shift(),
				"path": prefix + $this.find(".item_title a").attr("href"),
				"title": $this.find(".item_title a").text(),
				"views": "0", // TODO
				"comments": $this.find(".count_livid").text(),
				"created": "0000-00-00T00:00:00Z"
			},

			// if this json is an item of the topic list, then comments[0] is op info and comments[1] is last updater
			// if this json is topic, then comments[0] is op full info and others is comments.
			"comments": [
				{
					"user": {
						"name": $this.find(".small.fade a").eq(1).text(),
						"path": prefix + $this.find(".small.fade a").eq(1).attr("href")
					}
				},
				{
					"timeAgo": null,
					"timeIso": null,
					"user": {
						"name": $this.find(".small.fade a").eq(2).text(),
						"path": prefix + $this.find(".small.fade a").eq(2).attr("href")
					}
				}
			]
		};
	}).get();
}

