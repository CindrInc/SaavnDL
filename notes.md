#Write to file:

fs.writeFile('./output.txt', body, function(err) {
    if(err) {
        console.log(err);
    }
    console.log("File saved!");
});