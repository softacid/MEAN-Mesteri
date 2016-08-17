module.exports = {
  'port': process.env.PORT || 3000,
  'database': 'mongodb://localhost:27017/mesteri',
  'secret': 'ilovescotchscotchyscotchscotch',
  'baseUrl': 'http://localhost:3000',
  'smtpConfig' : {
    'host': 'smtp.zoho.com',
    'port': 465,
    'secure': true, // use SSL
    'auth': {
      'user': 'info@test.com',
      'pass': 'pass'
    }
  }
};
