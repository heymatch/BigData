/**
 * https://bigquery.googleapis.com/bigquery/v2/projects/bigquery-public-data/datasets/covid19_open_data/tables/covid19_open_data/data
 */

var BigQuery = {
    isAuthorized: null,
    currentApiRequest: null,
    GoogleAuth: null,
    SCOPE: 'https://www.googleapis.com/auth/bigquery',

    init(){
        var self = this;
        gapi.auth.authorize({
            'clientId': '983979492947-ei8sos3i1rgftrvoa3c77mia97q4eqbb.apps.googleusercontent.com',
            'scope': 'https://www.googleapis.com/auth/bigquery'
            }, 
        function() {
            gapi.load('client:auth2', function(){self.load()});
            gapi.client.load('bigquery', 'v2');
        });
    },

    load(){
        var self = this;
        gapi.client.init({
            'apiKey': 'AIzaSyCARw1uzUsSbQB0vJqe0tAzlQQLNF2LKIA',
            'clientId': '983979492947-ei8sos3i1rgftrvoa3c77mia97q4eqbb.apps.googleusercontent.com',
            //'discoveryDocs': [discoveryUrl],
            'scope': 'https://www.googleapis.com/auth/bigquery'
        }).then(function () {
            self.GoogleAuth = gapi.auth2.getAuthInstance();

            // Listen for sign-in state changes.
            self.GoogleAuth.isSignedIn.listen(function(){self.updateSigninStatus()});

            // Handle initial sign-in state. (Determine if user is already signed in.)
            var user = self.GoogleAuth.currentUser.get();
            self.setSigninStatus();

            // Call handleAuthClick function when user clicks on
            //      "Sign In/Authorize" button.
            
            $('#sign-in-or-out-button').click(function() {
                self.handleAuthClick();
            });
        });
    },

    handleAuthClick() {
        if (this.GoogleAuth.isSignedIn.get()) {
            // User is authorized and has clicked "Sign out" button.
            this.GoogleAuth.signOut();

        } else {
            // User is not signed in. Start Google auth flow.
            this.GoogleAuth.signIn();
        }
    },

    setSigninStatus() {
        var user = this.GoogleAuth.currentUser.get();
        var isAuthorized = user.hasGrantedScopes(this.SCOPE);
    
        if (isAuthorized) {
            $('#sign-in-or-out-button').html('Sign out');
        } else {
            $('#sign-in-or-out-button').html('Sign In/Authorize');
            
        }

        if (this.GoogleAuth.isSignedIn.get()) {
            $("#select").removeAttr("disabled");
            initUI();
        }
        else{
            $("#select").attr("disabled");
        }
   
    },

    updateSigninStatus() {
        this.setSigninStatus();
    },

    // 'SELECT * FROM [bigquery-public-data:covid19_open_data.covid19_open_data] LIMIT 10;'
    async request(query){
        var self = this;
        if (self.GoogleAuth.isSignedIn.get()){
            var request = gapi.client.bigquery.jobs.query({
                'projectId': 'bigdata-301014',
                'timeoutMs': '30000',
                'useLegacySql' : false,
                'query': query
            });
        }

        return request;
    },
}