function benchmark()
{
  var paths = [
    '/user/105242287939464144485', '/user/103273125772837332061', '/user/111960598910547229684', '/user/101397753425638859326',
    '/user/114108375455131396492', '/user/114109513675079343070', '/user/114112168677691215677', '/user/114112888254125003482',
    '/user/114140214185767783137', '/user/114147724022038070745', '/user/114157712270193521430', '/user/114169977401561876513',
    '/user/114275154902904189113', '/user/114285936092305652941', '/user/114289018249784076052', '/user/114294516217469729797'
  ];
  paths = [paths[0]];
  benchmarkEach(paths, 1).then(_=>Logger.log('Summary:\n'+toCSV()));
}

function benchmarkEach(paths, num)
{
    if(num > paths.length)
      return Promise.resolve();
    var subpaths = paths.slice(0, num);
    var rs = runPromise(subpaths);
    return Promise.resolve(rs).then(_=>{
      return benchmarkEach(paths, num*2);
    });
}

function getService()
{
	var acc = getServiceAccount();
    var service = OAuth2.createService('Firebase')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      .setPrivateKey(acc.private_key).setIssuer(acc.client_email)
      .setPropertyStore(PropertiesService.getScriptProperties())
      .setScope('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/firebase.database');
    return service;
}

function runSync(paths)
{
    var start = new Date().getTime();
    var fbase = FirebaseApp.getDatabaseByUrl("https://formfacade.firebaseio.com", getService().getAccessToken());
    for(var i=0; i<paths.length; i++)
      usr = fbase.getData(paths[i]);
    end('runSync for '+paths.length, start);
}

function runPromise(paths)
{
    var start = new Date().getTime();
	var admin = require("firebase-admin");
	var serviceAccount = getServiceAccount();
	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount),
	  databaseURL: "https://formfacade.firebaseio.com"
	});
    var prms = paths.map(path=>admin.database().ref(path).once('value'));
    //prms = prms.concat(paths.map(path=>admin.database().ref(path+'/firefast').update({test:true})));
	Promise.all(prms).then(rs=>{
      var usrs = rs.map(snap=>snap.val());
      end('runPromise for '+paths.length, start);
	});
}

async function runAsync(paths)
{
    var start = new Date().getTime();
	var admin = require("firebase-admin");
	var serviceAccount = getServiceAccount();
	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount),
	  databaseURL: "https://formfacade.firebaseio.com"
	});
    var usrsnaps = [];
    for(var i=0; i<paths.length; i++)
      usrsnaps.push(await admin.database().ref(paths[i]).once('value'));
	var usrs = usrsnaps.map(usrsnap=>usrsnap.val());
    end('runAsync for '+paths.length, start);
}

TimeStack = [];
function end(fn, start)
{
    var elapsed = new Date().getTime()-start;
    TimeStack.push([fn, elapsed]);
}

function toCSV()
{
  var hdr = 'Name, Time\n';
  var rws = TimeStack.map(rw=>rw.join(', ')).join('\n');
  return hdr+rws;
}
