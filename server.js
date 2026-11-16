const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Book Database
let books = [
    {
        id: 1,
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        genre: "Computer Science",
        year: 2009
    },
    {
        id: 2,
        title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow",
        author: "Aurélien Géron",
        genre: "Data Science",
        year: 2019
    },
    {
        id: 3,
        title: "Clean Code: A Handbook of Agile Software Craftsmanship",
        author: "Robert C. Martin",
        genre: "Software Engineering",
        year: 2008
    }
];

// Helper: Find book by id
const findBookById = (id) => books.find(b => b.id === parseInt(id, 10));

// ==========================================
// RESTful API Endpoints (CRUD)
// ==========================================

// 1. GET /api/books - Get all books (with optional ?genre= filter)
app.get('/api/books', (req, res) => {
    const { genre } = req.query;
    if (genre) {
        const filtered = books.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
        return res.json({ success: true, count: filtered.length, data: filtered });
    }
    res.json({ success: true, count: books.length, data: books });
});

// 2. GET /api/books/:id - Get a single book by ID
app.get('/api/books/:id', (req, res) => {
    const book = findBookById(req.params.id);
    if (!book) {
        return res.status(404).json({ success: false, message: `Book with id ${req.params.id} not found.` });
    }
    res.json({ success: true, data: book });
});

// 3. POST /api/books - Create a new book
app.post('/api/books', (req, res) => {
    const { title, author, genre, year } = req.body;

    // Simple validation
    if (!title || !author) {
        return res.status(400).json({ success: false, message: 'Please provide both title and author.' });
    }

    const newBook = {
        id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
        title: title.trim(),
        author: author.trim(),
        genre: genre ? genre.trim() : 'General',
        year: year ? parseInt(year, 10) : new Date().getFullYear()
    };

    books.push(newBook);
    res.status(201).json({ success: true, message: 'Book added successfully.', data: newBook });
});

// 4. PUT /api/books/:id - Update an existing book completely
app.put('/api/books/:id', (req, res) => {
    const book = findBookById(req.params.id);
    if (!book) {
        return res.status(404).json({ success: false, message: `Book with id ${req.params.id} not found.` });
    }

    const { title, author, genre, year } = req.body;

    if (!title || !author) {
        return res.status(400).json({ success: false, message: 'Please provide both title and author for update.' });
    }

    book.title = title.trim();
    book.author = author.trim();
    if (genre) book.genre = genre.trim();
    if (year) book.year = parseInt(year, 10);

    res.json({ success: true, message: 'Book updated successfully.', data: book });
});

// 5. DELETE /api/books/:id - Delete a book by ID
app.delete('/api/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id, 10));
    if (bookIndex === -1) {
        return res.status(404).json({ success: false, message: `Book with id ${req.params.id} not found.` });
    }

    const deletedBook = books.splice(bookIndex, 1)[0];
    res.json({ success: true, message: 'Book deleted successfully.', data: deletedBook });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[Exp 8] Books REST API server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
