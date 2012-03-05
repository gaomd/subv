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

function cacheTopic(tid, data) {
	var t = localStorage["topic" + tid];
	t.cache = data;
}

function cacheTopics(pageNo, data) {
	var p = localStorage["page" + pageNo];
	p = data;
}


function updateBoard(pageNo) {
	console.log("updating");
	console.log(new Date() + ": GETting");
	$.get("http://www.v2ex.com/changes?p=" + +pageNo, function(data) {
		// http://stackoverflow.com/a/6485092/753533 explains why do replace
		var html = data.responseText.replace(/<img\b[^>]*>/ig, '');
		var topics = $(html).find('#Content #topics_index .cell table').map(function() {
			var $p = $(this);
			var $meta = $p.find('.created').text();
			//console.log("splitting " + $meta);
			return {
				id: $p.find('.bigger a').attr('href').substr(3).split('#')[0],
				comments: $p.find('.bigger a').attr('href').substr(3).split('#')[1].replace('reply', ''),
				title: $p.find('.bigger a').text(),
				author: $p.find('.created a.dark:nth-child(1)').text(),
				authorId: $p.parent().attr('class').split(' ').pop().substr(5),
				tagHumanName: $p.find('.created a.node').text(),
				tagUnixName: $p.find('.created a.node').attr('href').substr(4),
				lastCommentor: $meta.split(' ').pop(),
				// very very unreliable, be careful
				// TODO views: $meta.split('•')[3].split('次点击')[0].trim(),
				// wont split the bullet?
				// TODO time: $meta.split('&bullet;').pop().split('ago')[0].trim()
			}
		}).get();
		console.log(new Date() + ": got");
		//console.log(topics[0]);
		for (var i = 0; i < topics.length; i++) {
			// update page
			// needed? $('#board').empty();
			$('#board').html(
				$('#topic-template').render(topics)
			);
		}
		console.log(new Date() + ": rendered");
	});
}

function expandTopic(id) {
	$.get('http://www.v2ex.com/t/' + id, function(data) {
		console.log(new Date() + ": GETting");
		// tmp solution, gonna parse img, swf, gist, etc later
		var html = data.responseText.replace(/<img\b[^>]*>/ig, '');
		var topic = {
			// mainained
			content: $(html).find('#Content .topic_content').html(),
			comments: $(html).find('.reply table').map(function() {
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
		console.log(new Date() + ": got");
		//console.log('appending comments');
		//console.log('id is: ' + id);
		//console.log('content is: ' + topic.content);
		//console.log('comments[0] is: ' + topic.comments[0].content);
		//$('#board #' + id).addClass('expanded');
		//$('#board #' + id + ' > .content').html(topic.content);
		for (var i = topic.comments.length - 1; i >= 0; i--) {
			$('#board #' + id + ' .commentarea').append(
				$('#comment-template').render(topic.comments[i])
			);
		}
		console.log(new Date() + ": rendered");
	});
}

$(function() {
	updateBoard(1);
	chrome.browserAction.setBadgeText({ text: '111' });
	chrome.browserAction.setBadgeBackgroundColor({ color: [150, 210, 100, 200] });
});

