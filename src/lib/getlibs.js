var fs = require('fs'),
	libs = require('./libs.json');

var remote = '',
	pyFile = 'import urllib.request\n\n',
	shFile = '#!/bin/bash\n\n';

for(var local in libs) {
	remote = libs[local];

	pyFile += "remote = '"+remote+"'\n";
	pyFile += "local = '"+local+"'\n";
	pyFile += "print('Downloading file >> ')\n";
	pyFile += "print(remote)\n";
	pyFile += "urllib.request.urlretrieve(remote, local)\n\n";

	shFile += "curl -L " + remote + " > " + local;
}

if(process.argv[2] === 'sh') {
	fs.writeFileSync('getlibscurl.sh', shFile, 'utf8');
} else {
	fs.writeFileSync('getlibs.py', pyFile, 'utf8');
}