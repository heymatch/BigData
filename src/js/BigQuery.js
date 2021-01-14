/**
 * https://bigquery.googleapis.com/bigquery/v2/projects/bigquery-public-data/datasets/covid19_open_data/tables/covid19_open_data/data
 */

class BigQuery{
    constructor(){
        this.isAuthorized;
        this.currentApiRequest;
        this.GoogleAuth;
        this.SCOPE = 'https://www.googleapis.com/auth/bigquery';
        
        this.handleClientLoad();
    }

    initClient(){
        
        // In practice, your app can retrieve one or more discovery documents.
        // var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

        // Initialize the gapi.client object, which app uses to make API requests.
        // Get API key and client ID from API Console.
        // 'scope' field specifies space-delimited list of access scopes.
        gapi.client.init({
            'apiKey': 'AIzaSyCARw1uzUsSbQB0vJqe0tAzlQQLNF2LKIA',
            'clientId': '983979492947-ei8sos3i1rgftrvoa3c77mia97q4eqbb.apps.googleusercontent.com',
            //'discoveryDocs': [discoveryUrl],
            'scope': 'https://www.googleapis.com/auth/bigquery'
        }).then(function () {
            this.GoogleAuth = gapi.auth2.getAuthInstance();

            // Listen for sign-in state changes.
            this.GoogleAuth.isSignedIn.listen(updateSigninStatus);

            // Handle initial sign-in state. (Determine if user is already signed in.)
            var user = this.GoogleAuth.currentUser.get();
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

    handleAuthClick() {
        if (this.GoogleAuth.isSignedIn.get()) {
            // User is authorized and has clicked "Sign out" button.
            this.GoogleAuth.signOut();
        } else {
            // User is not signed in. Start Google auth flow.
            this.GoogleAuth.signIn();
        }
    }

    revokeAccess() {
        this.GoogleAuth.disconnect();
    }

    setSigninStatus() {
        var user = this.GoogleAuth.currentUser.get();
        var isAuthorized = user.hasGrantedScopes(this.SCOPE);
    
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

    updateSigninStatus() {
        setSigninStatus();
    }

    handleClientLoad() {
        // Load the API's client and auth2 modules.
        // Call the initClient function after the modules load.
        gapi.load('client:auth2', this.initClient);
    }

    query(){
        var user = this.GoogleAuth.currentUser.get();
        var isAuthorized = user.hasGrantedScopes(this.SCOPE);
        if(isAuthorized){
            var request = gapi.client.request({
                'method': 'GET',
                'path': 'https://bigquery.googleapis.com/bigquery/v2/projects/bigquery-public-data/datasets/covid19_open_data/tables/covid19_open_data/data',
                'params': {'maxResults': 10}
            });
            // Execute the API request.
            request.execute(function(response) {
                console.log(response);
            });
        }
    }
}