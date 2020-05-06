
/**
 * Initialize firebase
 * @param {any} cfg configuration
 */
function initializeApp(cfg)
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

credential = {
  cert:function(acc)
  {
    return acc;
  }
};

/**
 * Get firebase realtime database
 * @return {any} database reference
 */
function database()
{
  if(this.rtdb)
    return this.rtdb;
  else
    throw new Error('Firebase not initialized');
}
