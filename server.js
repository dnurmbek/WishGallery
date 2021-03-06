const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
let last = 0;

mongoose.connect('mongodb://localhost:27017/wishingDB', { useUnifiedTopology: true })

const app = express();
app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.static('images'));

wishSchema = new mongoose.Schema({
    wishName: String,
    wishDescription: String,
    image: String
});

wishModel = mongoose.model('Wish', wishSchema); //create model out of the wishSchema

//setting multer
let upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './images')
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));// see nimi kasutatakse siis kui faili salvestad.
        }
    })
})

app.get('/', (req, res) => {
    wishModel.find()
        .then(document => {
            console.log(document);
            
            res.render('index',{item: document});
        });
});

app.get('/random', (req, res) => {
    
    wishModel.find()
        .then(document => {
            console.log(`Viimane väärtus: ${last}`);
            var random = Math.floor(Math.random() * (document.length));
            console.log(`Genereeris: ${random}`);
            if (random == last && (random+1) != document.length){
                random +=1;
                console.log(`Muudetud väärtus: ${random}`);
            }
            else if(random == last && (random+1) == document.length){
                random -=1;
                console.log(`Muudetud väärtus: ${random}, et vältida kordust:`);
            }
            console.log("\n");
            res.render('random',{item: document[random]});
            // console.log(document[random]);
            last = random;
        });
});



app.get('/admin', (req, res) => {
    res.render('wish');
})


app.post('/upload', upload.single('userFile'), (req, res) => {
    console.log(req.file);
    //ühekaupa faili lisamine

    let newWish = new wishModel();
    newWish.wishDescription = req.body.description;
    newWish.image = req.file.filename;

    newWish.save((error, document) => {
        if (!error) {
            console.log('file saved');
            res.redirect('/');
        }
        else {
            console.log(error);
        }
    });
});




const port = 5000;

app.listen(port, () => {
    console.log(`Server is running on Port ${port}.`)
});