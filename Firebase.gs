class Firebase
{
	constructor()
	{
		this.credential = {
			cert:function(acc)
			{
				return acc;
			}
		};
	}

	initializeApp(cfg)
	{
		this.config = cfg;
		this.service =  OAuth2.createService('Firebase')
			.setTokenUrl('https://accounts.google.com/o/oauth2/token')
			.setPrivateKey(cfg.credential.private_key)
			.setIssuer(cfg.credential.client_email)
			.setPropertyStore(PropertiesService.getScriptProperties())
			.setScope('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/firebase.database');
		this.rtdb = new FirebaseRTDB(this);
	}

	database()
	{
		if(this.rtdb)
			return this.rtdb;
		else
			throw new Error('Firebase not initialized');
	}
}

class FirebaseRTDB
{
	constructor(firebase)
	{
		this.firebase = firebase;
		var dburl = firebase.config.databaseURL;
		var acctok = firebase.service.getAccessToken();
    	this.db = FirebaseApp.getDatabaseByUrl(dburl, acctok);
    	this.pending = [];
	}
	
	getData(path)
	{
		return this.db.getData(path);
	}

	ref(path)
	{
		return new ReferenceRTDB(this, path);
	}
}

class ReferenceRTDB
{
	constructor(rtdb, path)
	{
		this.rtdb = rtdb;
		this.path = path;
	}

	once(type, executor)
	{
		var prm = new RequestRTDB(executor, this, 'get');
		this.rtdb.pending.push(prm);
		return prm;
	}
}

class RequestRTDB extends Promise 
{
    constructor(executor, ref, method, data, opts) 
    {
        super((resolve, reject) => {
            return executor(resolve, reject);
        });
		this.ref = ref;
		this.method = method;
		this.data = data;
		this.opts = opts;
    }

    getRequest()
    {
    	return {
			method:this.method, path:this.ref.path,
			data:this.data, optQueryParameters:this.opts
    	};
    }

    then(onFulfilled, onRejected)
    {
    	if(this.method=='get')
    	{
    		var curr = this;
    		var snap = {
    			val:function(){
    				return curr.execute();
    			}
    		};
    		return onFulfilled(snap);
    	}
    	else
    		return onFulfilled(this.execute());
    }

    execute()
    {
    	if(this.value) return this.value;
    	var rtdb = this.ref.rtdb;
    	var reqs = rtdb.pending.map(pnd=>pnd.getRequest());
    	Logger.log('Executing '+JSON.stringify(reqs));
    	var values = FirebaseApp_._buildAllRequests(reqs, this.ref.rtdb.db);
    	values.forEach(function(val, v){
    		rtdb.pending[v].value = val;
    	});
    	return this.value;
    }
}



firebase = new Firebase();

var ff_req = typeof require!=='undefined'?require:null;

require = function(modnm)
{
	if(modnm=='firebase-admin')
	{
		return firebase;
	}
	else if(ff_req)
	{
		return ff_req(modnm);
	}
	else
	{
		var jsfl = ScriptApp.getResource(modnm);
		var json = jsfl.getDataAsString();
		return JSON.parse(json);
	}
}
