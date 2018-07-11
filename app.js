var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    cfenv = require( 'cfenv' ),
    app = express();
var settings = require( './settings' );

var appEnv = cfenv.getAppEnv();

var reports = [];  //. ����ꗗ

//. �ÓI�� HTML �̃t�H���_
app.use( express.static( __dirname + '/public' ) );

//. POST ���N�G�X�g�ւ̑Ή�
app.use( bodyParser.urlencoded( { extended: true, limit: '10mb' } ) );
app.use( bodyParser.json() );

//. ���O�C��(POST /login)
app.post( '/login', function( req, res ){
  res.contentType( 'application/json' );  //. ���ʂ� JSON �t�H�[�}�b�g�ŕԂ�

  //. ���͂��ꂽ id �ƃp�X���[�h
  var user_id = req.body.user_id;
  var password = req.body.password;
  
  //. ���O�C���ۂ𔻒f
  //. �@�{���͎Г����[�U�[���ȂǂƘA�g���Ĕ��f����
  //. �@���̎����ł� user_id �ɉ����l���܂܂�Ă��āAuser_id == password �ł���ΐ����Ƃ���
  if( user_id && user_id == password ){
    //. ���O�C������
    res.write( JSON.stringify( { status: true, user_id: user_id, message: 'login succeeded.' }, null, 2 ) );
    res.end();
  }else{
    //. ���O�C�����s
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'login failed.' }, null, 2 ) );
    res.end();
  }
});

//. �����ۑ�(POST /report)
app.post( '/report', function( req, res ){
  res.contentType( 'application/json' );  //. ���ʂ� JSON �t�H�[�}�b�g�ŕԂ�
  
  //. ���M���e
  var report = req.body;
  
  //. �o���f�[�V����
  if( report.body && report.user_id && report.date ){
    var id = ( new Date() ).getTime();  //. �b��I�Ƀ^�C���X�^���v����� id �Ƃ���
    report.id = id;
    
    reports.push( report );
    res.write( JSON.stringify( { status: true, id: id }, 2, null ) );
    res.end();
  }else{
    //. �ۑ����s
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'not validated.' }, null, 2 ) );
    res.end();
  }
});

//. ����ꗗ���擾����(GET /reports)
app.get( '/reports', function( req, res ){
  res.contentType( 'application/json' );  //. ���ʂ� JSON �t�H�[�}�b�g�ŕԂ�
  
  var user_id = req.query.user_id;
  
  if( !user_id ){
    //. user_id �p�����[�^���w�肳��ĂȂ�����
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'parameter user_id required.' }, null, 2 ) );
    res.end();
  }else{
    //. user_id �p�����[�^����v������̂��������o��
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

//. ���� ID �̓�����擾����(GET /report/:id)
app.get( '/report/:id', function( req, res ){
  res.contentType( 'application/json' );  //. ���ʂ� JSON �t�H�[�}�b�g�ŕԂ�
  
  var id = req.params.id;
  
  if( !id ){
    //. id �p�����[�^���w�肳��ĂȂ�����
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'access with id . GET /report/:id' }, null, 2 ) );
    res.end();
  }else{
    //. id �p�����[�^����v������̂��������o��
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


