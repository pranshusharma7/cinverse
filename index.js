const { MongoClient } = require("mongodb");
const readline = require("readline");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) => {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
};

async function main() {
    try {
        await client.connect();

        console.log("Connected to MongoDB Successfully!");

        const db = client.db("SchoolDB");
        const students = db.collection("students");

        await students.createIndex(
            { rollNumber: 1 },
            { unique: true }
        );

        while (true) {
            console.log("\n===== STUDENT MANAGEMENT SYSTEM =====");
            console.log("1. Add Student");
            console.log("2. View All Students");
            console.log("3. Update Student");
            console.log("4. Delete Student");
            console.log("5. Exit");

            const choice = await ask("Enter your choice: ");

            // CREATE
            if (choice === "1") {
                const name = await ask("Enter student name: ");
                const studentClass = await ask("Enter class: ");
                const rollNumber = await ask("Enter roll number: ");

                await students.insertOne({
                    name,
                    class: studentClass,
                    rollNumber
                });

                console.log("Student added successfully!");
            }

            // READ
            else if (choice === "2") {
                const allStudents = await students.find({}).toArray();

                console.log("\n===== STUDENT RECORDS =====");

                if (allStudents.length === 0) {
                    console.log("No student records found.");
                } else {
                    allStudents.forEach(student => {
                        console.log("----------------------");
                        console.log("Name:", student.name);
                        console.log("Class:", student.class);
                        console.log("Roll Number:", student.rollNumber);
                    });
                }
            }

            // UPDATE
            else if (choice === "3") {
                const rollNumber = await ask("Enter roll number to update: ");

                const name = await ask("Enter new name: ");
                const studentClass = await ask("Enter new class: ");

                const result = await students.updateOne(
                    { rollNumber },
                    {
                        $set: {
                            name,
                            class: studentClass
                        }
                    }
                );

                if (result.matchedCount > 0) {
                    console.log("Student updated successfully!");
                } else {
                    console.log("Student not found!");
                }
            }

            // DELETE
            else if (choice === "4") {
                const rollNumber = await ask("Enter roll number to delete: ");

                const result = await students.deleteOne({ rollNumber });

                if (result.deletedCount > 0) {
                    console.log("Student deleted successfully!");
                } else {
                    console.log("Student not found!");
                }
            }

            // EXIT
            else if (choice === "5") {
                console.log("Exiting Student Management System...");
                break;
            }

            else {
                console.log("Invalid choice! Try again.");
            }
        }

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await client.close();
        rl.close();
    }
}

main();