/*
var project_id = 'bigdata-301014';
var client_id = 'bigdata-301014.apps.googleusercontent.com';

var config = {
'client_id': client_id,
'scope': 'https://www.googleapis.com/auth/bigquery'
};*/

var isAuthorized;
var currentApiRequest;
var GoogleAuth;
var SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';

function main(){
    var map = new Globe();
    handleClientLoad();
}
/*
function start() {
    // 2. Initialize the JavaScript client library.
    gapi.client.init({
        'apiKey': 'AIzaSyCARw1uzUsSbQB0vJqe0tAzlQQLNF2LKIA',
    // clientId and scope are optional if auth is not required.
    //    'clientId': '983979492947-ei8sos3i1rgftrvoa3c77mia97q4eqbb.apps.googleusercontent.com',
    //    'scope': 'profile',
    }).then(function() {
        GoogleAuth = gapi.auth2.getAuthInstance();
        GoogleAuth.isSignedIn.listen(updateSigninStatus);
        // 3. Initialize and make the API request.
        return gapi.client.request({
            'path': 'https://people.googleapis.com/v1/people/me?requestMask.includeField=person.names',
        })
    }).then(function(response) {
        console.log(response.result);
    }, function(reason) {
        if(reason.error !== undefined)
            console.log('Error: ' + reason.error + ": " + reason.details);
        else if(reason.result !== undefined)
            console.log('Error: ' + reason.result.error.message);
        else 
            console.log('Error: ' + reason);
    });
  };
  */

  function initClient() {
    // In practice, your app can retrieve one or more discovery documents.
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        'apiKey': 'AIzaSyCARw1uzUsSbQB0vJqe0tAzlQQLNF2LKIA',
        'clientId': '983979492947-ei8sos3i1rgftrvoa3c77mia97q4eqbb.apps.googleusercontent.com',
        'discoveryDocs': [discoveryUrl],
        'scope': SCOPE
    }).then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      GoogleAuth.isSignedIn.listen(updateSigninStatus);

      // Handle initial sign-in state. (Determine if user is already signed in.)
      var user = GoogleAuth.currentUser.get();
      setSigninStatus();

      // Call handleAuthClick function when user clicks on
      //      "Sign In/Authorize" button.
      
      $('#sign-in-or-out-button').click(function() {
        handleAuthClick();
      });
      $('#revoke-access-button').click(function() {
        revokeAccess();
      });
    });
  }

  function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
      // User is authorized and has clicked "Sign out" button.
      GoogleAuth.signOut();
    } else {
      // User is not signed in. Start Google auth flow.
      GoogleAuth.signIn();
    }
  }

  function revokeAccess() {
    GoogleAuth.disconnect();
  }

  function setSigninStatus() {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    
    if (isAuthorized) {
      $('#sign-in-or-out-button').html('Sign out');
      $('#revoke-access-button').css('display', 'inline-block');
      $('#auth-status').html('You are currently signed in and have granted ' +
          'access to this app.');
    } else {
      $('#sign-in-or-out-button').html('Sign In/Authorize');
      $('#revoke-access-button').css('display', 'none');
      $('#auth-status').html('You have not authorized this app or you are ' +
          'signed out.');
    }
  }

  function updateSigninStatus() {
    setSigninStatus();
  }

function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
  }
