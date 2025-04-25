import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, SECRET_KEY } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { createRoomSchema, signInSchema, signUpSchema } from "@repo/common/types";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.json("it's ok");
});

app.post("/sign-up", async (req: Request, res: Response) => {
  const parseData = signUpSchema.safeParse(req.body);
  if (parseData.success == false) {
    res.json("Invalid data");
    return;
  }

  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const createUser = await PrismaClient.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  res.json({
    message: "user created",
    data: { ...createUser },
  });

  // const userId = 1;
  // const token = jwt.sign({ userId }, JWT_SECRET);
  // res.json({ token });
});

app.post("/sign-in", async (req: Request, res: Response) => {
  try {
    const parseData = signInSchema.safeParse(req.body);

    if (parseData.success == false) {
      res.json("Invalid data");
      return;
    }
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(403).json({
        success: true,
        message: "ALl field are required",
      });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Incorrect Email or password",
      });
      return;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      res.status(400).json({
        success: false,
        message: "Incorrect Email or password",
      });
      return;
    }
    const tokenData = {
      userId: user.id,
    };
    const token = jwt.sign(tokenData, SECRET_KEY, {
      expiresIn: "1d",
    });
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.firstName}`,
      });
  } catch (error) {
    console.log("🚀 ~ app.post ~ error:", error);
    res.status(400).json({
      message: "Somethings went wrong",
      success: false,
    });
    return;
  }
});

app.post("/room", middleware, (req: Request, res: Response) => {
  //db call
  try {
    const parseData = createRoomSchema.safeParse(req.body);

    if (parseData.success == false) {
      res.json("Invalid data");
      return;
    }
  } catch (error) {
    console.log("🚀 ~ app.post ~ error:", error);
  }

  res.json({
    roomId: 123,
  });
});

app.listen(3001);
