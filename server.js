const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');
const cors = require('cors');

const app = express();
const port = 3000;
const dbFile = 'db.json';

app.use(bodyParser.json());
app.use(cors());

// In-memory database
let db = {};

//Function save database
const saveDatabase = async () => {
    try {
        await fs.writeFile(dbFile, JSON.stringify(db, null, 2));
    } catch (err) {
        console.error('Failed to save database:', err);
    }
};

//Function load database
const loadDatabase = async () => {
    try {
        const data = await fs.readFile(dbFile, 'utf-8');
        db = JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('Database file not found. Initializing empty database.');
            db = {};
        } else {
            console.error('Failed to load database:', err);
        }
    }
};

//Function add document
const addDocument = (collection, doc) => {
    const id = uuidv4();
    if(!db[collection]) {
        db[collection] = {};
    }
    db[collection][id] = {id, ...doc};
    saveDatabase();
    return db[collection][id];
};

//Function get all document
const getDocuments = (collection) => {
    return db[collection] ? Object.values(db[collection]) : [];
};

//Function get document by id
const getDocumentById = (collection, id) => {
    return db[collection] ? db[collection][id] : null;
};

const updateDocument = (collection, id, updates) => {
    if (!db[collection] || !db[collection][id]) {
        return null;
    }
    db[collection][id] = { ...db[collection][id], ...updates };
    saveDatabase();
    return db[collection][id];
};

const deleteDocument = (collection, id) => {
    if (!db[collection] || !db[collection][id]) {
        return null;
    }
    const deleted = db[collection][id];
    delete db[collection][id];
    saveDatabase();
    return deleted;
};

// const initializeDatabase = () => {
//     addDocument('users', { name: 'Alice', email: 'alice@example.com' });
//     addDocument('users', { name: 'Bob', email: 'bob@example.com' });
//     addDocument('products', { name: 'Laptop', price: 1000 });
//     addDocument('products', { name: 'Phone', price: 500 });
// };

//Query

app.post('/api/v1/:collection', (req, res) => {
    const collection = req.params.collection;
    const doc = req.body;
    const newDoc = addDocument(collection, doc);
    res.json(newDoc);
});

app.get('/api/v1', (req, res) => {
    res.json(db);
});

app.get('/api/v1/:collection', (req, res) => {
    const collection = req.params.collection;
    const docs = getDocuments(collection);
    res.json(docs);
});


app.get('/api/v1/:collection/:id', (req, res) => {
    const collection = req.params.collection;
    const id = req.params.id;
    const doc = getDocumentById(collection, id);
    if (!doc) {
        res.status(404).send('Document not found');
        return;
    }
    res.json(doc);
});

app.put('/api/v1/:collection/:id', (req, res) => {
    const collection = req.params.collection;
    const id = req.params.id;
    const updates = req.body;
    const updatedDoc = updateDocument(collection, id, updates);
    if (!updatedDoc) {
        res.status(404).send('Document not found');
        return;
    }
    res.json(updatedDoc);
});

app.delete('/api/v1/:collection/:id', (req, res) => {
    const collection = req.params.collection;
    const id = req.params.id;
    const deletedDoc = deleteDocument(collection, id);
    if (!deletedDoc) {
        res.status(404).send('Document not found');
        return;
    }
    res.json(deletedDoc);
});

app.listen(port, async () => {
    await loadDatabase();
    initializeDatabase();
    console.log(`Server is running on http://localhost:${port}`);
});
