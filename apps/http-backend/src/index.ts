import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, SECRET_KEY } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {
  createRoomSchema,
  signInSchema,
  signUpSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());

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

  const createUser = await prismaClient.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  res.json({
    message: "user created",
    data: { ...createUser },
  });
});
//@ts-ignore
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
    const user = await prismaClient.user.findUnique({
      where: { email },
    });
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
        message: `Welcome back ${user.name}`,
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

app.post("/room", middleware, async (req: Request, res: Response) => {
  //db call
  try {
    const parseData = createRoomSchema.safeParse(req.body);

    if (parseData.success == false) {
      res.json("Invalid data");
      return;
    }
    //@ts-ignore
    const userID = req.userId;
    const room = await prismaClient.room.create({
      data: {
        slug: parseData.data.name,
        adminId: userID,
      },
    });
    res.status(400).json({
      message: "succesfully created roomId",
      roomId: room.id,
    });
    return;
  } catch (error) {
    console.log("🚀 ~ app.post ~ error:", error);
  }

  res.json({
    roomId: 123,
  });
});

app.get("/chat/:roomId", async (req: Request, res: Response) => {
  const roomId = req.params.roomId;

  const messages = await prismaClient.chat.findMany({
    where: {
      roomId: roomId,
    },
    orderBy: {
      id: "desc",
    },
    take: 50,
  });
  res.json({ messages });
});

app.listen(3001);
