
import express from "express";
import { ObjectId } from "mongodb";
import { connectToMongoDB } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let students;

// Connect MongoDB and start server
async function startServer() {
    try {
        const client = await connectToMongoDB();

        const db = client.db("SchoolDB");
        students = db.collection("students");

        // Prevent duplicate roll numbers
        await students.createIndex(
            { rollNumber: 1 },
            { unique: true }
        );

        // READ: Get all students
        app.get("/api/students", async (req, res) => {
            try {
                const records = await students.find({}).toArray();
                res.json(records);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // CREATE: Add student
        app.post("/api/students", async (req, res) => {
            try {
                const { name, class: studentClass, rollNumber } = req.body;

                if (!name?.trim() || !studentClass?.trim() || !rollNumber?.trim()) {
                    return res.status(400).json({
                        message: "All fields are required"
                    });
                }

                const result = await students.insertOne({
                    name: name.trim(),
                    class: studentClass.trim(),
                    rollNumber: rollNumber.trim()
                });

                res.status(201).json({
                    message: "Student added successfully",
                    insertedId: result.insertedId
                });
            } catch (error) {
                const duplicate = error.code === 11000;

                res.status(duplicate ? 409 : 500).json({
                    message: duplicate
                        ? "Roll number already exists"
                        : error.message
                });
            }
        });

        // UPDATE: Update student
        app.put("/api/students/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const { name, class: studentClass, rollNumber } = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({
                        message: "Invalid student ID"
                    });
                }

                if (!name?.trim() || !studentClass?.trim() || !rollNumber?.trim()) {
                    return res.status(400).json({
                        message: "All fields are required"
                    });
                }

                const result = await students.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            name: name.trim(),
                            class: studentClass.trim(),
                            rollNumber: rollNumber.trim()
                        }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({
                        message: "Student not found"
                    });
                }

                res.json({ message: "Student updated successfully" });

            } catch (error) {
                res.status(error.code === 11000 ? 409 : 500).json({
                    message: error.code === 11000
                        ? "Roll number already exists"
                        : error.message
                });
            }
        });

        // DELETE: Delete student
        app.delete("/api/students/:id", async (req, res) => {
            try {
                const { id } = req.params;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({
                        message: "Invalid student ID"
                    });
                }

                const result = await students.deleteOne({
                    _id: new ObjectId(id)
                });

                if (result.deletedCount === 0) {
                    return res.status(404).json({
                        message: "Student not found"
                    });
                }

                res.json({ message: "Student deleted successfully" });

            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
            console.log("Student Management API is ready!");
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
