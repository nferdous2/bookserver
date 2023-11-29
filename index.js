
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());


// mongodb connection.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yhxur.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 3000;



async function run() {
  try {
    await client.connect();
    const database = client.db("books");
    const bookCollection = database.collection("book");



    app.post("/books", async (req, res) => {
      const { name, image, publisher, publicationYear, genre, authorName } = req.body;
      const book = {
        name,
        image, publisher, publicationYear: parseInt(publicationYear), // Convert to number
        genre, authorName
      };

      try {
        const result = await bookCollection.insertOne(book);
        res.json({ message: "Book added successfully", insertedId: result.insertedId });
      } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).json({ message: "An error occurred while adding the book" });
      }

    })

    // get books

    app.get("/books", async (req, res) => {
      const book = {};
      const cursor = bookCollection.find(book);
      const books = await cursor.toArray();
      res.send(books);
    })

    app.put("/books/:id", async (req, res) => {
      const id = req.params.id;
      const { name, image, publisher, publicationYear, genre, authorName, status } = req.body;
    
      try {
        const result = await bookCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { name, image, publisher, publicationYear, genre, authorName, status, } }
        );
    
        if (result.modifiedCount > 0) {
          res.json({ message: "Book updated successfully" });
        } else {
          res.status(404).json({ message: "Book not found" });
        }
      } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ message: "An error occurred while updating the book" });
      }
    });
    
    // get a book by ID
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Received ID:", id);
      const book = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(book)
      res.json(result);

    });


    // Delete a book by ID
    app.delete("/books/:id", async (req, res) => {

      const id = req.params.id;
      const book = { _id: new ObjectId(id) };
      const result = await bookCollection.deleteOne(book)
      res.json(result);
 
    });


    app.listen(port, () => {
      console.log("Running on port", port);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
