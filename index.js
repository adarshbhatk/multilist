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

const items = [eat, code, sleep];

// Item.insertMany(items);

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
    let items = [];
    let result = await getListItems();
    result.forEach((item) => {
        items.push(item.name);
        })
    // console.log("Item names are: ", items);

    res.render("index.ejs", {
      listTitle: day,
      listItems: items,
    });
  });
  
//   app.post("/add", async (req, res) => {
//     const item = req.body.newItem;
//     try {
//       await db.query("INSERT INTO items (title) VALUES ($1);", [item]);
//       res.redirect("/");
//     } catch (error) {
//       console.log(error);
//     }
//   });
  
//   app.post("/edit", async (req, res) => {
//     const itemId = req.body.updatedItemId;
//     const itemName = req.body.updatedItemTitle;
//     // console.log("Updated item id and title are: ", itemId, itemName);
//     try {
//       await db.query("UPDATE items SET title = $1 WHERE id = $2;", [itemName, itemId]);
//       res.redirect("/");
//     } catch (error) {
//       console.log(error);
//     }
//   });
  
//   app.post("/delete", async (req, res) => {
//     const id = req.body.deleteItemId;
//     // console.log("Delete id: ", id);
//     try {
//       await db.query("DELETE FROM items WHERE id = $1;", [id]);
//       res.redirect("/");
//     } catch (error) {
//       console.log(error);
//     }
//   });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);    
});