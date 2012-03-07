var pref = {
	debug: true,
}

function debug(o) {
	if (pref.debug) {
		console.log(o);
	}
}

function loadTopicList(pageNo) {
	$.get("http://www.v2ex.com/changes?p=" + +pageNo, function(html) {
		var topicList = topicListParse(html);
		debug(topicList);
		for (var i = topicList.length - 1; i >= 0; i--) {
			$('#board').append(
				$('#topic-template').render(topicList[i])
			);
		}
	});
}

function loadTopic(id) {
	$.get('http://www.v2ex.com/t/' + id, function(html) {
		var topic = topicParse(html);
		debug(topic);
		$('#board #' + id).addClass('expanded');
		$('#board #' + id + ' > .content').html(topic.content);
		for (var i = topic.comments.length - 1; i >= 0; i--) {
			$('#board #' + id + ' .commentarea').append(
				$('#comment-template').render(topic.comments[i])
			);
		}
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

// the nasty part... extract HTML text into JSON
function topicParse(html) {
	// tmp solution, gonna parse swf, gist, etc later
	var html = killImgTag(extractResponseText(html));
	var $dom = $(html);
	var topic = {
		// following is same as in topicList but more up-to-date
		topicId: $dom.find('form[method="post"]').attr('action').replace('/t/', ''),
		commentsCount: $dom.find('.bigger a').attr('href').substr(3).split('#')[1].replace('reply', ''),
		title: $dom.find('#Content .cell h1').text(),
		author: $dom.find('#Content .cell small .dark').text(),
		authorId: null, // TODO
		tagId: $dom.find('#Content .box .cell .bigger a:nth-child(3)').attr('href'),
		tagName: $dom.find('#Content .box .cell .bigger a:nth-child(3)').text(),
		lastCommentor: null, // TODO
		hasContent: false, // TODO
		// unreliable because of caching
		viewsCount: viewsCount,
		timeAgo: $dom.find('#Content .cell small.fade').text(),
		// same thing ends

		// TODO lastActivity: $($('#Content .cell span.fade')[0]).text().split(' 直到 ')[1],
		content: $dom.find('#Content .topic_content').html(),
		comments: $dom.find('.reply table').map(function() {
			var $this = $(this);
			return {
				order: $this.find('.snow').text().split('-')[0].trim().substr(1),
				timeAgo: $this.find('.snow').text().split('-')[1].split(' via ')[0].trim(),
				device: $this.find('.snow').text().split('-')[1].split(' via ')[1] || "Desktop",
				author: $this.find('strong .dark').text(),
				authorId: $this.parent().attr('class').split('_').pop(),
				commentId: $this.find('td:nth-child(3) > div').attr('id').split('_')[1],
				content: $this.find('.reply_content').html(),
			};
		}),
	}
}

// the nasty part... extract HTML text into JSON
function topicListParse(html) {
	var html = killImgTag(extractResponseText(html));
	var $dom = $(html);
	var topicList = {};
	topicList.page = $dom.find('.page_current').text();
	topicList.items = $dom.find('#Content #topics_index .cell table').map(function() {
		var $p = $(this);

		var meta = $p.find('.created').text().split(/replied by|•/);
		// possible meta format
		// ["DOMAIN", "AUTHOR", "CHAR_COUNT", "VIEWS", "TIME_AGO", "LAST_COMMENTOR"]
		// ["DOMAIN", "AUTHOR", "CHAR_COUNT", "VIEWS", "TIME_AGO"]
		// ["DOMAIN", "AUTHOR", "VIEWS", "TIME_AGO", "LAST_COMMENTOR"]
		// ["DOMAIN", "AUTHOR", "VIEWS", "TIME_AGO"]
		var viewsCount, timeAgo, hasContent, lastCommentor;
		meta.shift();
		meta.shift();
		if (/个字符/.test(meta[0])) {
			hasContent = true;
			meta.shift();
		}
		viewsCount = meta.shift().split("次点击").shift().trim();
		timeAgo = meta.shift().trim();
		if (meta.length === 0) {
			lastCommentor = "(nobody)";
		} else {
			lastCommentor = meta.shift().trim();
		}

		return {
			topicId: $p.find('.bigger a').attr('href').substr(3).split('#')[0],
			commentsCount: $p.find('.bigger a').attr('href').substr(3).split('#')[1].replace('reply', ''),
			title: $p.find('.bigger a').text(),
			author: $p.find('.created a.dark:nth-child(1)').text(),
			authorId: $p.parent().attr('class').split(' ').pop().substr(5),
			tagId: $p.find('.created a.node').attr('href').substr(4),
			tagName: $p.find('.created a.node').text(),
			lastCommentor: lastCommentor,
			hasContent: hasContent,
			// unreliable because of caching
			viewsCount: viewsCount,
			timeAgo: timeAgo,
		}
	}).get();
	return topicList;
}

$(function() {
	loadTopicList(1);
});

