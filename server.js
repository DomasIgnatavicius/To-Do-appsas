const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const mongoose = require('mongoose')
const date = require(__dirname + "/date.js");

app.set("view engine", "ejs")

const url = 'mongodb+srv://Domas:viens@todoapp.vraqtdv.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(url)
const db = mongoose.connection
db.on('error',(err) => console.log(err))
db.once('open',() => console.log('Connected to db'))

const itemsSchema = {
    name: String
}
const userSchema = {
    username: String,
    password: String
}

const Item = mongoose.model("Item", itemsSchema);
const User = mongoose.model("User", userSchema);

const item1 = new Item({
    name: "Welcome to your Todo List"
})
const item2 = new Item({
    name: "Hit + button to add new item"
})
const item3 = new Item({
    name: "<-- hit this to delete an item"
})

const defaultItems = [item1,item2,item3];

let activeUser = null;


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/",router);

app.use(express.static("public"));


const items = [];
const workItems = [];



router.get('/',(req,res) =>{
    let fullDate = date.getDate();
    if(activeUser === null){
        res.redirect('/login');
    }
    Item.find({}, (err,foundItems) =>{
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,(err) =>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully saved default items to db");
                }
            })
            res.redirect('/');
        }
        else
            res.render('list',{listTitle: fullDate, newListItems: foundItems})
    })

    
})
router.get('/login',(req,res) =>{
    let day = date.getDay();
    res.render('login',{kindof: "Today"})
})
router.get('/work',(req,res) =>{
    res.render('list',{listTitle: 'Work List', newListItems: workItems})
})
router.get('/about',(req,res) =>{
    res.render('about')
})


router.post('/', (req,res) =>{
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    })
    item.save();
    res.redirect('/');
    // if(req.body.list === "Work"){
    //     workItems.push(item)
    //     res.redirect('/work')
    // }
    // else{
    //     items.push(item);
    //     res.redirect('/');
    // }
    
})

router.post('/work', (req,res) => {
    res.redirect('/work')
})

router.post('/login', (req,res) =>{
    const name = req.body.username;
    const pass = req.body.password;

    console.log(req.body.submit);
    if(req.body.submit == "login"){
        User.findOne({username: name,password:pass},(err,foundUser) =>{
            if(err){
                console.log(err);
                res.redirect('/login');
            }
            //console.log(foundUser);
            else{
                activeUser = foundUser.id;
                console.log(activeUser);
                res.redirect('/');
            } 
        })
    }
    else{

        User.find({username: name,password:pass},(err,foundUser) =>{
            if(err){
                console.log(err);
                res.redirect('/login');
            }
            else{
                if(foundUser.length === 0){
                    const user = new User({
                        username: name,
                        password: pass
                    })
                    user.save();
                    activeUser = user.id;
                    console.log("User registered");
                    res.redirect('/');
                }
                else{
                    console.log("User already exists");
                    res.redirect('/login');
                }
                    
            } 
        })

    }
})

router.post('/delete', (req,res) =>{
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId,(err) =>{
        console.log(err);
    })
    res.redirect('/');
})

app.listen(3000,() => {
console.log("Started on PORT 3000");
})