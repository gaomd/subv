// at index
var urls = $('#Content #topics_index .cell').map(function() {
	var $p = $(this);
	return {
		path: $p.find('.bigger a').attr('href'),
	}
}).get();

// on the topic
//
// post
var title = $('#Content .cell h1').text();
var author = $('#Content .cell small .dark').text();
var time = $('#Content .cell small.fade').text();
var content = $('#Content .topic_content').text();
var lastUpdated = $($('#Content .cell span.fade')[0]).text().split(' 直到 ')[1];
//var tag = $('#Content .box .cell .bigger').text().split(' › ')[1].trim();
var tag = $('#Content .box .cell .bigger a:nth-child(3)').text();
var tagPath = $('#Content .box .cell .bigger a:nth-child(3)').attr('href');
// comments
$('.reply table').map(function() {
	var $r = $(this);
	return {
		level: $r.find('.snow').text().split('-')[0].trim().substr(1),
		time: $r.find('.snow').text().split('-')[1].split(' via ')[0].trim(),
		device: $r.find('.snow').text().split('-')[1].split(' via ')[1] || "Desktop",
		author: $r.find('strong .dark').text(),
		content: $r.find('.reply_content').text()
	};
}).get();

