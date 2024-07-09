import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const eat = new Item ({
    name: "Eat"
});

const code = new Item ({
    name: "Code"
});

const sleep = new Item ({
    name: "Sleep"
});

const defaultItems = [eat, code, sleep];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

const currentDate = new Date();

const options = { 
  weekday: 'long', 
  day: 'numeric', 
  month: 'long'
};

const day = currentDate.toLocaleDateString('en-US', options);

async function getListItems() {
    try {
        const items = await Item.find({});
        return items;
    } catch (error) {
      console.log(error);
    }
  }

  app.get("/", async (req, res) => {
    const items = await getListItems();
    if(items.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect("/");
    } else {
        res.render("index.ejs", {
            listTitle: day,
            listItems: items,
          });
    }
  });

  app.get("/:customRoute", async (req, res) => {
    const customRoute = req.params.customRoute;

    const foundList = await List.findOne({name: customRoute});
    
    if(!foundList) {
        const list = new List({
            name: customRoute,
            items: defaultItems
        });
        list.save(); 
        res.redirect("/" + customRoute);
      } else {
        res.render("index.ejs", {
            listTitle: customRoute + " - " + day,
            listItems: foundList.items,
          });
      }

  });
  
  app.post("/add", async (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if(listName != day) {
        List.findOne({name: listName})
        .then(foundList => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
        .catch(err => {
            console.log(err);
        });
    } else {
        item.save();
        res.redirect("/");
    }
  });
  
  app.post("/edit", async (req, res) => {
    const itemId = req.body.updatedItemId;
    const itemName = req.body.updatedItemTitle;
    try {
      await Item.updateOne({_id: itemId}, {name: itemName});
      res.redirect("/");
    } catch (error) {
      console.log(error);
    }
  });
  
  app.post("/delete", async (req, res) => {
    const itemId = req.body.deleteItemId;
    const listName = req.body.listName;

    if(listName != day) {
        await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}});
            res.redirect("/" + listName);
    } else {
        await Item.deleteOne({_id: itemId});
        res.redirect("/");
    }
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);    
});