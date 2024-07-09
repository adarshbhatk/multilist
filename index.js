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
  
  app.post("/add", async (req, res) => {
    const item = new Item({
        name: req.body.newItem
    });
    try {
      item.save();
      res.redirect("/");
    } catch (error) {
      console.log(error);
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
    try {
      await Item.deleteOne({_id: itemId});
      res.redirect("/");
    } catch (error) {
      console.log(error);
    }
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);    
});