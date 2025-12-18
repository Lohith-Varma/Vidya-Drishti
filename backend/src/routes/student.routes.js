const express = require("express");
const prisma = require("../prismaClient");

const router = express.Router();

router.get("/:email", async (req, res) => {
  const { email } = req.params;
  console.log("EMAIL PARAM:", req.params.email);

  const student = await prisma.student.findUnique({
    where: { email },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});


module.exports = router;
