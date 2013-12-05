var cp = require('child_process');

var config = require('konphyg')(__dirname + '/config');
var conf = config('main');

var sys = require('sys');
var asciimo = require('asciimo').Figlet;
var colors = require('colors'); // add colors for fun

var font = 'Ogre';
var welcome = "== Windpush ==";
asciimo.write(welcome,font,function(art){
        sys.puts(art.white);
	sys.puts(("Allow CORS -- " + conf.allowCORS).white);
	sys.puts(("Allow Prefllight -- " + conf.allowPreflight).white);
	sys.puts(("AllowJSONP -- " + conf.allowJSONP).white);
	sys.puts("----------------------------------------".blue);
	var n = cp.fork(__dirname + '/restServer.js');
	sys.puts("Starting Rest Server".blue);

});




