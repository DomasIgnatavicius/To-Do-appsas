const express = require("express");
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
    name: String,
    date: Date
}
const userSchema = {
    username: String,
    password: String
}

const Item = mongoose.model("Item", itemsSchema);
const User = mongoose.model("User", userSchema);

let activeUser = null;


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/",router);

app.use(express.static("public"));

router.get('/',(req,res) =>{
    let fullDate = date.getDate();
    if(activeUser === null){
        res.redirect('/login');
    }
    else{
        Item.find({}, (err,foundItems) =>{
            if(err){
                console.log(err);
            }
            User.findOne({activeUser},(err,foundUser) =>{
                if(err){
                    console.log(err);
                    res.redirect('/');
                }
                else{
                    console.log(activeUser);
                    console.log(foundUser);
                    res.render('list',{listTitle: fullDate, newListItems: foundItems, activeUser: foundUser.username})
                } 
            })
            
        })
    }
})
router.get('/login',(req,res) =>{
    let day = date.getDay();
    res.render('login',{kindof: "Today"})
})

router.get('/getItemById',(req,res) =>{
    let id = req.query.id;
    console.log(id);
    Item.findOne({id: id},(err,foundItem) =>{
        if(err){
            console.log(err);
            res.redirect('/');
        }
        else{
            //console.log(foundItem);
            res.send(foundItem)
        } 
    })
})

router.post('/edit',async (req,res) =>{
    console.log();
    let id = req.body.saveId;
    let newName = req.body.editItemText;
    let newDate = req.body.editItemDate;
    console.log(newName);
    //Item.findByIdAndUpdate({id},{name: newName,date:newDate})
    let doc = await Item.findById(id);
    console.log(doc);
    if(newName == null || newName == ""){
        doc.date = newDate;
    }
    else{
        doc.name = newName;
        doc.date = newDate;
    }
    await doc.save();
    res.redirect('/')
})


router.post('/', (req,res) =>{
    const itemName = req.body.newItem;
    const dueDate = req.body.dueDate;
    const item = new Item({
        name: itemName,
        date: dueDate
    })
    item.save();
    res.redirect('/');
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