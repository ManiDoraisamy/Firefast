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
    
    push(data, executor)
    {
		var prm = new RequestRTDB(executor, this, 'post', data);
		this.rtdb.pending.push(prm);
		return prm;
    }
    
    set(data, executor)
    {
		var prm = new RequestRTDB(executor, this, 'put', data);
		this.rtdb.pending.push(prm);
		return prm;
    }
    
    update(data, executor)
    {
		var prm = new RequestRTDB(executor, this, 'patch', data);
		this.rtdb.pending.push(prm);
		return prm;
    }
    
    remove(executor)
    {
		var prm = new RequestRTDB(executor, this, 'delete');
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
    	var values = FirebaseApp_._buildAllRequests(reqs, this.ref.rtdb.db);
    	values.forEach(function(val, v){
    		rtdb.pending[v].value = val;
    	});
    	return this.value;
    }
}

