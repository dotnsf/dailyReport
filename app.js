var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    cfenv = require( 'cfenv' ),
    app = express();
var settings = require( './settings' );

var appEnv = cfenv.getAppEnv();

var reports = [];  //. Reports

//. �ÓI�� HTML �̃t�H���_
app.use( express.static( __dirname + '/public' ) );

//. POST ���N�G�X�g�ւ̑Ή�
app.use( bodyParser.urlencoded( { extended: true, limit: '10mb' } ) );
app.use( bodyParser.json() );

//. Login(POST /login)
app.post( '/login', function( req, res ){
  res.contentType( 'application/json' );  //. Result's content type

  //. Retrieve parameters
  var user_id = req.body.user_id;
  var password = req.body.password;

  //. Login judgement
  //.  Usually we use LDAP or other directory system for this judgement.
  //.  In this implementation, it would be OK if (1)user_id is defined, and (2)user_id == password
  if( user_id && user_id == password ){
    //. OK
    res.write( JSON.stringify( { status: true, user_id: user_id, message: 'login succeeded.' }, null, 2 ) );
    res.end();
  }else{
    //. Not valid
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'login failed.' }, null, 2 ) );
    res.end();
  }
});

//. Create new report(POST /report)
app.post( '/report', function( req, res ){
  res.contentType( 'application/json' );  //. Result's content type

  //. Retrieve parameters
  var report = req.body;

  //. Report needs to contain body, user_id, and date
  if( report.body && report.user_id && report.date ){
    var id = ( new Date() ).getTime();  //. Generate report_id from timestamp
    report.id = id;

    reports.push( report );
    res.write( JSON.stringify( { status: true, id: id }, 2, null ) );
    res.end();
  }else{
    //. Not valid
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'not validated.' }, null, 2 ) );
    res.end();
  }
});

//. Get all reports for specific user(GET /reports)
app.get( '/reports', function( req, res ){
  res.contentType( 'application/json' );  //. Result's content type

  //. Retrieve parameters
  var user_id = req.query.user_id;

  if( !user_id ){
    //. user_id is required parameter, but not set
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'parameter user_id required.' }, null, 2 ) );
    res.end();
  }else{
    //. Retrieve reports based on user_id
    var user_reports = [];
    reports.forEach( function( report ){
      if( report.user_id == user_id ){
        user_reports.push( report );
      }
    });

    res.write( JSON.stringify( { status: true, reports: user_reports }, null, 2 ) );
    res.end();
  }
});

//. Retrieve one report with specific id(GET /report/:id)
app.get( '/report/:id', function( req, res ){
  res.contentType( 'application/json' );  //. Result's content type

  //. Retrieve parameters
  var id = req.params.id;

  if( !id ){
    //. id is required parameter, but not set
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'access with id . GET /report/:id' }, null, 2 ) );
    res.end();
  }else{
    //. Retrieve report based on id 
    var user_report = null;
    reports.forEach( function( report ){
      if( report.id == id ){
        user_report = report;
      }
    });

    if( user_report ){
      res.write( JSON.stringify( { status: true, reports: user_reports }, null, 2 ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: 'no report found with id: ' + id }, null, 2 ) );
      res.end();
    }
  }
});


app.listen( appEnv.port );
console.log( "server starting on " + appEnv.port + " ..." );
