students <- c("A", "B", "C", "D", "E")
marks <- c(45, 60, 75, 80, 90)

data <- data.frame(students, marks)

print(data)

barplot(marks,
        names.arg = students,
        main = "Student Marks",
        xlab = "Students",
        ylab = "Marks",
        col = "skyblue",
        border = "black")


boxplot(marks,
        main = "Boxplot of Student Marks",
        ylab = "Marks",
        col = "lightgreen",
        border = "black")