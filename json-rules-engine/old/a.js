function xx() {

  myRe = new RegExp('^Warning', 'g');
  var myArray = myRe.exec('xWarning alskdjalksjdlakj');
  return myRe.lastIndex > 0;
}

console.log(xx());
