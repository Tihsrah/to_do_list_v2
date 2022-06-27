//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//mongodb+srv://Tihsrah:harshlf4@cluster0.mzqbbfb.mongodb.net/todolistDB
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema={
  item:{
    type:String
  }
}
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  item:"Welcome To Your To-Do-List!"
})
const item2=new Item({
  item:"Press + to add new items."
})
const item3=new Item({
  item:"Press the checkbox to delete an item."
})

const defaultItems=[item1,item2,item3]


const listSchema={
  name:String,
  items: [itemsSchema]
}

const List=mongoose.model("List",listSchema);





app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
        }else{
          console.log("Success")
        }
      })
      res.redirect('/');
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item=new Item({
    item:itemName
  })

  if(listName==="Today"){
    item.save();
    res.redirect('/');
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post('/delete',function(req,res){
  const checkedbox=req.body.itm;
  const listName=req.body.listName;

  if (listName==="Today"){
    Item.findByIdAndRemove(checkedbox,function(err){
      if(err){
        console.log(err)
      }
    })
    res.redirect('/')
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedbox}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})

//here
app.get("/:customListName", function(req,res){
  const customName=_.capitalize(req.params.customListName);
  // res.render("extra", {listTitle: customName, newListItems: workItems});

  List.findOne({name:customName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customName,
          items:defaultItems
        })

        list.save()
        res.redirect("/"+customName);
      }else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })


});

app.post("/custom", function(req,res){
  const logbox=_.capitalize(req.body.login);
  // console.log(logbox);

  List.findOne({name:logbox},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:logbox,
          items:defaultItems
        })

        list.save()
        res.redirect("/"+logbox);
      }else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })


});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
