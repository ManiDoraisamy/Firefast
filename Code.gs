function benchmark()
{
  var curr = this;
  ['runSync','runPromise','runAsync'].forEach(fn=>{
    var start = new Date().getTime();
    curr[fn]();
    var elapsed = new Date().getTime()-start;
    Logger.log('Time take for '+fn+' is '+elapsed);
  });
}

function runSync()
{
    Logger.log('runSync');
	var acc = getServiceAccount();
    var service = OAuth2.createService('Firebase')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      .setPrivateKey(acc.private_key).setIssuer(acc.client_email)
      .setPropertyStore(PropertiesService.getScriptProperties())
      .setScope('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
    var fbase = FirebaseApp.getDatabaseByUrl("https://formfacade.firebaseio.com", service.getAccessToken());
	var usr = fbase.getData('/user/105242287939464144485/profile');
	var team = fbase.getData('/team/105242287939464144485/info');
	Logger.log(usr);
	Logger.log(team);
}

function runPromise()
{
    Logger.log('runPromise');
	var admin = require("firebase-admin");
	var serviceAccount = getServiceAccount();
	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount),
	  databaseURL: "https://formfacade.firebaseio.com"
	});
	var usrprm = admin.database().ref('/user/105242287939464144485/profile').once('value');
	var teamprm = admin.database().ref('/team/105242287939464144485/info').once('value');
	Promise.all([usrprm,teamprm]).then(rs=>{
		var usr = rs[0].val();
		var team = rs[1].val();
		Logger.log(usr);
		Logger.log(team);
	});
}

async function runAsync()
{
    Logger.log('runAsync');
	var admin = require("firebase-admin");
	var serviceAccount = getServiceAccount();
	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount),
	  databaseURL: "https://formfacade.firebaseio.com"
	});
	var usrsnap = await admin.database().ref('/user/105242287939464144485/profile').once('value');
	var teamsnap = await admin.database().ref('/team/105242287939464144485/info').once('value');
	var usr = usrsnap.val();
	var team = teamsnap.val();
	Logger.log(usr);
	Logger.log(team);
}

