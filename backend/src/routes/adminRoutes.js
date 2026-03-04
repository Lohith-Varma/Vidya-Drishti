import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import prisma from "../config/db.js";

const router = express.Router();

router.post(
  "/create-college",
  authenticate,
  authorize("MAIN_ADMIN"),
  async (req, res) => {

    const college = await prisma.college.create({
      data: {
        name: req.body.name
      }
    });

    res.json(college);
  }
);

export default router;