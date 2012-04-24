
		var itSrc =
		{
			"tag": {
				"name": "Tag Name",
				"path": "/go/to",
				"infoHtml": "<strong>Content</strong>"
			},

			"topic": {
				"id": "12345",
				"path": "/t/12345",
				"title": "10 reasons why Subv rocks!",
				"views": "12306",
				"comments": "9999",
				"created": "0000-00-00T00:00:00Z"
			},

			// if this json is an item of the topic list, then comments[0] is op info and comments[1] is last updater
			// if this json is topic, then comments[0] is op full info and others is comments.
			"comments": [
				{
					"id": "1",
					"contentHtml": "NULL",
					"timeAgo": "2 minute ago",
					"timeIso": "2012-11-22T11:20:34Z",
					"user": {
						"id": "0",
						"name": "_op",
						"path": "/member/_op"
					}
				},
				{
					"id": "24",
					"contentHtml": "NULL",
					"timeAgo": "0 minute ago",
					"timeIso": "2012-11-22T11:22:34Z",
					"user": {
						"id": "1337",
						"name": "_l33t",
						"path": "/member/_l33t"
					}
				}
			]
		};


