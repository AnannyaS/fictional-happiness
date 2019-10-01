const express= require('express');
const multer= require('multer');
const ejs = require('ejs');
const path = require('path');

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

var jsonContent="", jsonToken="";

// Set storage engine
const storage = multer.diskStorage({
    destination: 'public/uploads',
    filename: function(req,file, cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits:{ fileSize:1000000},
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
}).single('myImage');

// Check File Type
function checkFileType(file,cb){
    // Allowed extensions 
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
     // Check mime
     const mimetype =filetypes.test(file.mimetype);

     if(mimetype && extname){
return(cb(null,true));
     }else{
         cb('Error: Images only');
     }
}

const app = express();

app.set('view engine', 'ejs');

// Public folder
app.use(express.static('./public'));

app.get('/',(req,res)=> res.render('index'));

app.post('/upload',upload.single('avatar'),(req,res)=>{
    //res.send('test');

    upload(req,res,(err,files) =>{
        var file_name = files.file.name;
        var file_ext = files.file.type;

if(err){
    res.render('index',{
        msg: err
    });
}
else{
    if(req.file == undefined){
        res.render('index',{
            msg: 'Error: No file selected!'
        });
    }else{
        authorize(jsonContent, uploadFile,req,(err,link)=>{
            if(err){
                res.render('index',{
                    msg: err
                });
            } else{
                console.log(req.file);
                res.render('index',{
                    msg: 'File Uploaded!',
                    file:`uploads/${req.file.filename}`,
                    link: link
                })
            }
        })

    }
}

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), uploadFile);//------
      });
  
      /**
       * Create an OAuth2 client with the given credentials, and then execute the
       * given callback function.
       * @param {Object} credentials The authorization client credentials.
       * @param {function} callback The callback to call with the authorized client.
       */
      function authorize(credentials, callback) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);
  
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
          if (err) return getAccessToken(oAuth2Client, callback);
          oAuth2Client.setCredentials(JSON.parse(token));
          callback(oAuth2Client);
        });
      }
  
      /**
       * Get and store new token after prompting for user authorization, and then
       * execute the given callback with the authorized OAuth2 client.
       * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
       * @param {getEventsCallback} callback The callback for the authorized client.
       */
      function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
          rl.close();
          oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) return console.error(err);
              console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
          });
        });
      }
  
      // Target forlder for the Uploaded file.
      const targetFolderId = "1AdJJwkxq9VnH4ut7a_UXyW0Eh69ww3WP";
      function uploadFile(auth) {
        const drive = google.drive({ version: 'v3', auth });
  
        var fileMetadata = {
          'name': file_name,
          parents: [targetFolderId]
        };
        var media = {
          mimeType: file_ext,
          body: fs.createReadStream(path.join(__dirname, 'uploads/', file_name))
        };
        drive.files.create({
  
          resource: fileMetadata,
          media: media,
          fields: 'id'
        }, function (err, file) {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            console.log(`file Id:${file.data.id}`);
          }
        });
       
      }
    });

});





const port = 5000;

app.listen(port,()=>{
    console.log(`Server started on ${port}`)
});


