function isVisited(tid, ncomments) {
	var t = localStorage["topic" + tid];
	if (t && t.visited) {
		return true;
	} else {
		return false;
	}
}

function hasNewComments(tid, ncommentsNow) {
	var t = localStorage["topic" + tid];
	if (t.ncomments !== ncommentsNow) {
		return true;
	} else {
		return false;
	}
}

function visited(tid, ncomments) {
	var t = localStorage["topic" + tid];
	t.ncomments = ncomments;
	t.visited = true;
}

function updateBoard(pageNo) {
	//console.log("updating");
	//console.log(new Date() + ": GETting");
	$.get("http://www.v2ex.com/changes?p=" + +pageNo, function(html) {
		//console.log(new Date() + ": got, parsing");
		var topicList = topicListParse(html);
		//console.log(new Date() + ": parsed in JSON");
		//console.log(topics[0]);
		//console.log("items count: " + topics.length);
		renderTopicList(topicList);
		for (var i = topicList.length - 1; i >= 0; i--) {
			// update page
			// needed? $('#board').empty();
			$('#board').append(
				$('#topic-template').render(topicList[i])
			);
		}
		//console.log(new Date() + ": rendered");
	});
}

function renderTopicList() {
}

function expandTopic(id) {
	console.log(new Date() + ": GETting");
	$.get('http://www.v2ex.com/t/' + id, function(html) {
		console.log(new Date() + ": got, parsing");
		console.log(new Date() + ": parsed into JSON");
		var topic = topicParse(html);
		//console.log('appending comments');
		console.log('id is: ' + id);
		console.log('content is: ' + topic.content);
		console.log('comments[0] is: ' + topic.comments[0].content);
		$('#board #' + id).addClass('expanded');
		$('#board #' + id + ' > .content').html(topic.content);
		for (var i = topic.comments.length - 1; i >= 0; i--) {
			$('#board #' + id + ' .commentarea').append(
				$('#comment-template').render(topic.comments[i])
			);
		}
		console.log(new Date() + ": rendered");
	});
}

// for consistency on YQL/XHR
function extractResponseText(o) {
	// TODO how to do type check correctly?
	if (o.responseText !== "undefined") {
		return o.responseText;
	}
}

// avoid browser load images while parsing text as DOM
// http://stackoverflow.com/a/6485092/753533 explains good
function killImgTag(text) {
	return text.replace(/<img\b.*?src="(.*?)".*?>.*?<\/img>/ig, '$1');
}

// the nauty part... extract HTML text into JSON
function topicParse(html) {
	// tmp solution, gonna parse swf, gist, etc later
	var html = killImgTag(extractResponseText(html));
	var $dom = $(html);
	var topic {
		id: $dom.find('form[method="post"]').attr('action').replace('/t/', ''),
		content: $dom.find('#Content .topic_content').html(),
		comments: $dom.find('.reply table').map(function() {
			var $r = $(this);
			return {
				tid: id,
				id: undefined, // TODO
				level: $r.find('.snow').text().split('-')[0].trim().substr(1),
				time: $r.find('.snow').text().split('-')[1].split(' via ')[0].trim(), // TODO remove ago
				device: $r.find('.snow').text().split('-')[1].split(' via ')[1] || "Desktop",
				author: $r.find('strong .dark').text(),
				content: $r.find('.reply_content').html(),
			};
		})
		// not needed
		//title: $('#Content .cell h1').text(),
		//author: $('#Content .cell small .dark').text(),
		//time: $('#Content .cell small.fade').text(),
		//lastUpdated: $($('#Content .cell span.fade')[0]).text().split(' 直到 ')[1],
		//tag: $('#Content .box .cell .bigger a:nth-child(3)').text(),
		//tagPath: $('#Content .box .cell .bigger a:nth-child(3)').attr('href'),
	}
}

// the nauty part... extract HTML text into JSON
function topicListParse(html) {
	var html = killImgTag(extractResponseText(html));
	var $dom = $(html);
	var topicList;
	topicList.page = $dom.find(.page_current').text();
	topicList.items = $dom.find('#Content #topics_index .cell table').map(function() {
		var $p = $(this);
		var meta = $p.find('.created').text().split('•');
		var viewsCount, timeAgo, titleOnly;
		if (meta.length === 4) {
			titleOnly = true;
			viewsCount = meta[2].split('次点击')[0].trim();
			timeAgo = meta[3].split(' replied ').shift().trim();
		} else if (meta.length === 5) {
			titleOnly = false;
			viewsCount = meta[3].split('次点击')[0].trim();
			timeAgo = meta[4].split(' replied ').shift().trim();
		}
		return {
			page: $p.find('.page_current').text(),
			id: $p.find('.bigger a').attr('href').substr(3).split('#')[0],
			commentsCount: $p.find('.bigger a').attr('href').substr(3).split('#')[1].replace('reply', ''),
			title: $p.find('.bigger a').text(),
			author: $p.find('.created a.dark:nth-child(1)').text(),
			authorId: $p.parent().attr('class').split(' ').pop().substr(5),
			tagId: $p.find('.created a.node').attr('href').substr(4),
			tagName: $p.find('.created a.node').text(),
			lastCommentor: $meta.split(' ').pop(),
			titleOnly: titleOnly,
			// unreliable because of caching
			viewsCount: viewsCount,
			timeAgo: timeAgo,
		}
	}).get();
	return topicList;
}

$(function() {
	updateBoard(1);
	chrome.browserAction.setBadgeText({ text: '111' });
	chrome.browserAction.setBadgeBackgroundColor({ color: [150, 210, 100, 200] });
});

