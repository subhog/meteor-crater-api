var fs = require('fs');
require('sugar');



String.prototype.dashify = function() {
  return this.replace(/[^a-zA-Z0-9]/g, '-').replace(/^\-*/, '').replace(/\-*$/, '').replace(/\-+/g, '-').toLowerCase();
};



/* Read raw data */
var files = fs.readdirSync(__dirname + '/src');

var raw = ' \n';

files.each(function(file) {
  raw += fs.readFileSync(__dirname + '/src/' + file);
});

var toc = [];
var output = '';



/* Compile TOC */

var compileToc = function() {
  var result = '';
  toc.each(function(item) {
    result += '    <div class="toc-div' + item.level + '">' +
    '<a href="#' + item.anchor + '">' + item.title + '</a>'+
    '</div>\n';
  });
  return result;
};


var getAnchor = function(level) {
  for(var i = toc.length - 1; i >= 0; --i) {
    if(toc[i].level < level) return toc[i].anchor;
  }
  return '';
};


/* Compile text */

var compileParagraph = function(text) {
  return text.replace(/`(.*)`/gm, '<code class="inline">$1</code>')
  .replace(/\*\*(.*)\*\*/gm, '<b>$1</b>')
  .replace(/---/g, '&mdash;')
  .replace(/--/g, '&ndash;')
  .replace(/\[(.*)\]\((.*)\)/g, '<a href="$2" class="a">$1</a>');
}


var compileText = function(chunk) {

  var array = chunk.split(/\n{2,}/g);
  var result = '';

  array.each(function(item) {

    if(item.match(/^\#/)) {
      result += '<h3>' + item + '</h3>\n';
    } else if(item.match(/^(?:\-.*\n)*(?:\-.*)$/)) {
      var lis = item.split('\n');
      result += '<ul>';
      lis.each(function(li) {
        result += '<li>' + compileParagraph(li.substr(1)) + '</li>\n';
      });
      result += '</ul>\n';
    } else {
      result += '<p>' + compileParagraph(item) + '</p>\n';
    }
  });

  return result;

};


var compileCode = function(chunk) {

};


/* Split by chapters */

var chapters = raw.split(/(.*(?:\n[=\-]{3,})+)/);


for(var i = 1; i + 1 < chapters.length; i += 2) {

  
  var chapterTitlePart = chapters[i].split('\n');
  var chapterContentPart = (' \n' + chapters[i+1] + '\n ').split(/\n`{3,}/);


  var level = (chapterTitlePart[1].startsWith('=')) ? 
    ( chapterTitlePart.length === 3 ? 1 : 3 ) :
    ( chapterTitlePart.length === 3 ? 2 : 4 );



  var h = 'h' + level;


  var anchor = chapterTitlePart[0].dashify();
  if(level > 1) anchor = anchor + '--' + getAnchor(level);

  toc.push({
    title: chapterTitlePart[0],
    level: level,
    anchor: anchor,
  });

  

  output += '\n<' + h + '><a name="' + anchor + '">' + chapterTitlePart[0] + '</a></' + h + '>\n';





  var content = '';
  var codeChunk = true;
  
  chapterContentPart.each(function(chunk) {
    codeChunk = !codeChunk;

    if(codeChunk) {
      content += '\n<pre class="pre"><code>' +
        chunk.replace(/&/g, '&amp;').replace(/</g, '&lt').replace(/>/g, '&gt').substr(1) +
        '</code></pre>\n';
    } else {
      content += '\n' + compileText(chunk) + '\n';
    }

  });
   

  output += content;
}




var html = '<html>\n' +
'<head>\n' + 
'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>\n' +
'<title>Documentation – Crater UI Library for Meteor.js</title>\n' +
'<link href="http://fonts.googleapis.com/css?family=Open+Sans:700,400&subset=latin,latin-ext" rel="stylesheet" type="text/css">\n' +
'<link href="http://fonts.googleapis.com/css?family=Source+Code+Pro:300&subset=latin,latin-ext" rel="stylesheet" type="text/css">\n' +
'<link rel="stylesheet" href="./style.css">\n' +
'</head>\n' +
'<body>\n' +
'<div class="github">' +
'</div>\n' +
'<div class="toc">\n' +
compileToc() +
'<div class="toc-ending">&nbsp;</div>' +
'</div>\n' +
'<div class="content">\n' +
output + 
'</div>\n' +
'</html>\n';


fs.writeFile(__dirname + '/index.html', html);







