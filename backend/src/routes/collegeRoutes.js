router.post(
  "/add-student",
  authenticate,
  authorize("COLLEGE_ADMIN"),
  async (req, res) => {

    const student = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: "STUDENT",
        collegeId: req.user.collegeId
      }
    });

    res.json(student);
  }
);