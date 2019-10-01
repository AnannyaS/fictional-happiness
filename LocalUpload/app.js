const express= require('express');
const multer= require('multer');
const ejs = require('ejs');
const path = require('path');

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
    limits:{ fileSize:100},
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
     const mimetype = filetypes.test(file.mimetype);

     if(mimetype && extname){
return(cb(null,true));
     }else{
         cb('Error: Images only');
     }
}

const app = express();

app.get('/',(req,res)=> res.render('index'));

app.post('/upload',(req,res)=>{
    //res.send('test');
    upload(req,res,(err) =>{
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
        console.log(req.file);
        res.render('index',{
            msg: 'File Uploaded!',
            file:`uploads/${req.file.filename}`
        })
    }
}
    });



    

});

app.set('view engine', 'ejs');

// Public folder
app.use(express.static('./public'));


const port =5000;

app.listen(port,()=>{
    console.log(`Server started on ${port}`)
});


