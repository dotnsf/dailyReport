var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    cfenv = require( 'cfenv' ),
    app = express();
var settings = require( './settings' );

var appEnv = cfenv.getAppEnv();

var reports = [];  //. 日報一覧

//. 静的な HTML のフォルダ
app.use( express.static( __dirname + '/public' ) );

//. POST リクエストへの対応
app.use( bodyParser.urlencoded( { extended: true, limit: '10mb' } ) );
app.use( bodyParser.json() );

//. ログイン(POST /login)
app.post( '/login', function( req, res ){
  res.contentType( 'application/json' );  //. 結果を JSON フォーマットで返す

  //. 入力された id とパスワード
  var user_id = req.body.user_id;
  var password = req.body.password;
  
  //. ログイン可否を判断
  //. 　本来は社内ユーザー情報などと連携して判断する
  //. 　この実装では user_id に何か値が含まれていて、user_id == password であれば成功とする
  if( user_id && user_id == password ){
    //. ログイン成功
    res.write( JSON.stringify( { status: true, user_id: user_id, message: 'login succeeded.' }, null, 2 ) );
    res.end();
  }else{
    //. ログイン失敗
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'login failed.' }, null, 2 ) );
    res.end();
  }
});

//. 日報を保存(POST /report)
app.post( '/report', function( req, res ){
  res.contentType( 'application/json' );  //. 結果を JSON フォーマットで返す
  
  //. 送信内容
  var report = req.body;
  
  //. バリデーション
  if( report.body && report.user_id && report.date ){
    var id = ( new Date() ).getTime();  //. 暫定的にタイムスタンプを日報 id とする
    report.id = id;
    
    reports.push( report );
    res.write( JSON.stringify( { status: true, id: id }, 2, null ) );
    res.end();
  }else{
    //. 保存失敗
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'not validated.' }, null, 2 ) );
    res.end();
  }
});

//. 日報一覧を取得する(GET /reports)
app.get( '/reports', function( req, res ){
  res.contentType( 'application/json' );  //. 結果を JSON フォーマットで返す
  
  var user_id = req.query.user_id;
  
  if( !user_id ){
    //. user_id パラメータが指定されてなかった
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'parameter user_id required.' }, null, 2 ) );
    res.end();
  }else{
    //. user_id パラメータが一致するものだけを取り出す
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

//. 特定 ID の日報を取得する(GET /report/:id)
app.get( '/report/:id', function( req, res ){
  res.contentType( 'application/json' );  //. 結果を JSON フォーマットで返す
  
  var id = req.params.id;
  
  if( !id ){
    //. id パラメータが指定されてなかった
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'access with id . GET /report/:id' }, null, 2 ) );
    res.end();
  }else{
    //. id パラメータが一致するものだけを取り出す
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


