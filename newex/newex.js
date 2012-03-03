
function updateBoard(pageNo) {
	console.log("updating");
	$.ajax({
		url: "http://www.v2ex.com/changes?p=" + +pageNo,
		success: function(html) {
			// http://stackoverflow.com/a/6485092/753533 explains why do replace
			html = html.replace(/<img\b[^>]*>/ig, '');
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
			//console.log(topics[0]);
			for (var i = 0; i < topics.length; i++) {
				// update page
				// needed? $('#board').empty();
				$('#board').html(
					$('#topic-template').render(topics)
				);
			}
		}
	});
}

$(function() {
	updateBoard(1);
});

function expandTopic(id) {
$.get('http://www.v2ex.com/t/' + id, function(html) {
	// tmp solution, gonna parse img, swf, gist, etc later
	html = html.replace(/<img\b[^>]*>/ig, '');
	var topic = {
		// mainained
		content: $('#Content .topic_content').text(),
		comments: $('.reply table').map(function() {
			var $r = $(this);
			return {
				level: $r.find('.snow').text().split('-')[0].trim().substr(1),
				time: $r.find('.snow').text().split('-')[1].split(' via ')[0].trim(),
				device: $r.find('.snow').text().split('-')[1].split(' via ')[1] || "Desktop",
				author: $r.find('strong .dark').text(),
				content: $r.find('.reply_content').text()
			};
		}),
		// not needed
		//title: $('#Content .cell h1').text(),
		//author: $('#Content .cell small .dark').text(),
		//time: $('#Content .cell small.fade').text(),
		//lastUpdated: $($('#Content .cell span.fade')[0]).text().split(' 直到 ')[1],
		//tag: $('#Content .box .cell .bigger a:nth-child(3)').text(),
		//tagPath: $('#Content .box .cell .bigger a:nth-child(3)').attr('href'),
	}
	$('#board #' + id + ' .commentarea').html($('#comment-template').render(topic));
});
}

