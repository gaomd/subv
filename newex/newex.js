// at index
function update() {
	$.ajax({
		url: "http://www.v2ex.com/changes?p=1",
		success: function(html) {
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
					views: $meta.split('•')[3].split('次点击')[0].trim(),
					time: $meta.split('•').pop().split('ago')[0].trim(),
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

/*
for (var i = 0; i < urls.length; i++) {
	
// on the topic
//
// post
var topic = function(id) {
	$.get('http://www.v2ex.com/t/' + id);
	return {
		title: $('#Content .cell h1').text(),
		author: $('#Content .cell small .dark').text(),
		time: $('#Content .cell small.fade').text(),
		content: $('#Content .topic_content').text(),
		lastUpdated: $($('#Content .cell span.fade')[0]).text().split(' 直到 ')[1],
		tag: $('#Content .box .cell .bigger a:nth-child(3)').text(),
		tagPath: $('#Content .box .cell .bigger a:nth-child(3)').attr('href'),
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
	}
}
*/
