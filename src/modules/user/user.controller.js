import { Router } from "express";
import { profile } from "./user.service.js";
import { UserModel } from "../../DB/model/user.model.js";
import { db } from "../../DB/connection.db.js";
const router = Router()

router.get("/", (req, res, next) => {
    const result = profile(req.query.id)
    return res.status(200).json({ message: "Profile", result })
})


/**
 * 1. Create an explicit collection named “books” with a validation rule to ensure that each
document has a non-empty “title” field. (0.5 Grade)
• URL: POST /collection/books
 */
router.post("/collection/books", (req, res, next) => {
    UserModel()
        .then(() => {
            return res.status(201).json({ message: "Collection 'books' created successfully." });
        })
        .catch(err => {
            if (err.code === 48) return res.status(400).json({ message: "Collection 'books' already exists." });
            next(err);
        });
})

/**.
 * 2. Create an implicit collection by inserting data directly into a new collection named
“authors”. (0.5 Grade)
• URL: POST /collection/authors
 */

router.post("/collection/authors", async (req, res, next) => {
    try {
        const result = await db.collection("authors").insertOne(req.body);
        return res.status(201).json({ message: "Collection 'authors' created implicitly.", result });
    } catch (error) {
        return next(error);
    }
})
/*
Create a capped collection named “logs” with a size limit of 1MB. (0.5 Grade)
• URL: POST /collection/logs/capped
*/ 

router.post("/collection/logs/capped", async (req, res, next) => {
    try {
        await db.createCollection("logs", {
            capped: true,
            size: 1024 * 1024
        });
        return res.status(201).json({ message: "Capped collection 'logs' created successfully with a size limit of 1MB." });
    } catch (error) {
        if (error.code === 48) {
            return res.status(400).json({ message: "Collection 'logs' already exists." });
        }
        return next(error);
    }
});
/**
 * 4. Create an index on the books collection for the title field. (0.5 Grade)
• URL: POST /collection/books/index
 */
router.post("/collection/books/index", async (req, res, next) => {
    try {
        await db.collection("books").createIndex({ title: 1 });
        return res.status(201).json({ message: "Index created on 'title' field for 'books' collection." });
    } catch (error) {
        return next(error);
    }
})
/**
 * 5. Insert one document into the books collection. (0.5 Grade)
• URL: POST /books
 */
router.post("/books", async (req, res, next) => {
    try {
        const result = await db.collection("books").insertOne(req.body);
        return res.status(201).json({ message: "Book inserted successfully.", result });
    } catch (error) {
        return next(error);
    }
})
/**
 * 6. Insert multiple documents into the books collection with at least three records. (0.5 Grade)
• URL: POST /books/batch
 */
router.post("/books/batch", async (req, res, next) => {
    try {
        const result = await db.collection("books").insertMany(req.body);
        return res.status(201).json({ message: "Multiple books inserted successfully.", result });
    } catch (error) {
        return next(error);
    }
})

/**
 * 7. Insert a new log into the logs collection. (0.5 Grade)
• URL: POST /logs
 */
router.post("/logs", async (req, res, next) => {
    try {
        const result = await db.collection("logs").insertOne(req.body);
        return res.status(201).json({ message: "Log inserted successfully.", result });
    } catch (error) {
        return next(error);
    }
})
/*
 * 8. Update the book with title “Future” change the year to be 2022. (0.5 Grade)
• URL: PATCH/books/Future
 */
router.patch("/books/:title", async (req, res, next) => {
    try {
        const { title } = req.params;
        const result = await db.collection("books").updateOne(
            { title: title },
            { $set: { year: 2022 } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Book not found" });
        }
        return res.status(200).json({ message: "Book updated successfully.", result });
    } catch (error) {
        return next(error);
    }
})

/**
 * 9. Find a Book with title “Brave New World”. (0.5 Grade)
• URL: GET /books/title => /books/title?title=Brave New World
 */
router.get("/books/title", async (req, res, next) => {
    try {
        const { title } = req.query;
        const result = await db.collection("books").findOne({ title: title });

        if (!result) {
            return res.status(404).json({ message: "Book not found" });
        }
        return res.status(200).json({ message: "Book found", result });
    } catch (error) {
        return next(error);
    }
})
/**
 * 10- Find all books published between 1990 and 2010. (0.5 Grade)
• URL: GET /books/year => /books/year?from=1990&to=2010
 */
router.get("/books/year", async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const fromYear = parseInt(from);
        const toYear = parseInt(to);

        const result = await db.collection("books").find({
            year: { $gte: fromYear, $lte: toYear }
        }).toArray();

        return res.status(200).json({ message: "Books found within the specified range", result });
    } catch (error) {
        return next(error);
    }
})
/**
 * 11. Find books where the genre includes "Science Fiction".(0.5 Grade)
• URL: /books/genre?genre=Science Fiction
 */
router.get("/books/genre", async (req, res, next) => {
    try {
        const { genre } = req.query;
        const result = await db.collection("books").find({ genres: genre }).toArray();

        return res.status(200).json({ message: "Books matching the genre retrieved", result });
    } catch (error) {
        return next(error);
    }
})

/*
12. Skip the first two books, limit the results to the next three, sorted by year in descending
order. (0.5 Grade)
• URL: GET /books/skip-limit
 */
router.get("/books/skip-limit", async (req, res, next) => {
    try {
        const result = await db.collection("books")
            .find({})
            .sort({ year: -1 })
            .skip(2)
            .limit(3)
            .toArray();

        return res.status(200).json({ message: "Success", result });
    } catch (error) {
        return next(error);
    }
})
/**
 * 13. Find books where the year field stored as an integer. (0.5 Grade)
• URL: GET /books/year-integer
 */
router.get("/books/year-integer", async (req, res, next) => {
    try {
        const result = await db.collection("books").find({
            year: { $type: "int" }
        }).toArray();

        return res.status(200).json({ message: "Books with integer year field", result });
    } catch (error) {
        return next(error);
    }
})
/**
14. Find all books where the genres field does not include any of the genres "Horror" or
"Science Fiction". (0.5 Grade)
• URL: GET /books/exclude-genres
 */
router.get("/books/exclude-genres", async (req, res, next) => {
    try {
        const result = await db.collection("books").find({
            genres: { $nin: ["Horror", "Science Fiction"] }
        }).toArray();

        return res.status(200).json({ message: "Books retrieved successfully excluding specified genres", result });
    } catch (error) {
        return next(error);
    }
})
/**
15. Delete all books published before 2000. (0.5 Grade)
• DELETE: GET /books/before-year?year=2000
 */
router.delete("/books/before-year", async (req, res, next) => {
    try {
        const { year } = req.query;
        const yearLimit = parseInt(year);

        const result = await db.collection("books").deleteMany({ year: { $lt: yearLimit } });

        return res.status(200).json({ message: "Books deleted successfully", result });
    } catch (error) {
        return next(error);
    }
})

/*
16. Using aggregation Functions, Filter books published after 2000 and sort them by year
descending. (0.5 Grade)
• URL: GET /books/aggregate1
 */
router.get("/books/aggregate1", async (req, res, next) => {
    try {
        const result = await db.collection("books").aggregate([
            { $match: { year: { $gt: 2000 } } },
            { $sort: { year: -1 } }
        ]).toArray();

        return res.status(200).json({ message: "Books retrieved using aggregation pipeline", result });
    } catch (error) {
        return next(error);
    }
})
/**
17. Using aggregation functions, Find all books published after the year 2000. For each
matching book, show only the title, author, and year fields. (0.5 Grade)
• URL: GET /books/aggregate2
 */
router.get("/books/aggregate2", async (req, res, next) => {
    try {
        const result = await db.collection("books").aggregate([
            { $match: { year: { $gt: 2000 } } },
            { $project: { _id: 0, title: 1, author: 1, year: 1 } }
        ]).toArray();

        return res.status(200).json({ message: "Books retrieved using aggregation pipeline with projection", result });
    } catch (error) {
        return next(error);
    }
})
/**
18. Using aggregation functions,break an array of genres into separate documents. (0.5 Grade)
• URL: GET /books/aggregate3
 */
router.get("/books/aggregate3", async (req, res, next) => {
    try {
        const result = await db.collection("books").aggregate([
            { $unwind: "$genres" }
        ]).toArray();

        return res.status(200).json({ message: "Genres unwound into separate documents", result });
    } catch (error) {
        return next(error);
    }
})
/**
 * 19. Using aggregation functions, Join the books collection with the logs collection. (1 Grade)
• URL: GET /books/aggregate4
 */
router.get("/books/aggregate4", async (req, res, next) => {
    try {
        const result = await db.collection("books").aggregate([
            {
                $lookup: {
                    from: "logs",
                    localField: "_id",
                    foreignField: "bookId",
                    as: "bookLogs"
                }
            }
        ]).toArray();

        return res.status(200).json({ message: "Books joined with logs retrieved successfully", result });
    } catch (error) {
        return next(error);
    }
})

export default router