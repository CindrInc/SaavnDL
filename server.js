const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const download = require('download');
const id3 = require('node-id3')
const path = require('path');
const fs = require('fs');


let port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



app.post('/song', (req, res, next) => {
	let mp3Link = req.body.mp3Link;
	let info = JSON.parse(req.body.info);

	let tempName = info.music + " - " + info.title;

	let artworkName = tempName + ".jpg";
	let mp3Name = tempName + ".mp3";

	download(mp3Link, './songs/', {
		filename: mp3Name
	}).then(() => {
		console.log("Downloaded: " + mp3Name);

		download(info.image_url, './artwork/', {
			filename: artworkName
		}).then(() => {
			console.log("Downloaded artwork: " + artworkName);

			let file = './songs/' + mp3Name;
			let tags = {
				artist: info.singers,
				title: info.title,
				album: info.album,
				date: parseInt(info.year),
				length: parseInt(info.duration),
				publisher: info.label,
				comment: {
					language: "eng",
					text: "Track Link: " + info.tiny_url
				},
				APIC: "./artwork/" + artworkName
			}
			id3.write(tags, file, function(err) {
				if(err) {
					throw err;
				} else {
					console.log("File Fixed: " + mp3Name);

					fs.unlink('./artwork/' + artworkName, (err) => {
						if (err) {
							throw err;
						} else {
							console.log("Artwork deleted: " + artworkName);
						}
					})
				}
			})
		});
	}).catch((err) => console.log(err));

	res.send('hi');

});

app.listen(port, () => {
	console.log("Server started on port " + port + "...")
});