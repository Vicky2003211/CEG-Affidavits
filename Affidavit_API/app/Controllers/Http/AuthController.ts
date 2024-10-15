import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import jwt from "jsonwebtoken";

export default class AuthController {
  public async login({ request, response }: HttpContextContract) {
    const { uname, password } = request.only(["uname", "password"]);
    const user = await User.findBy("uname", uname);
    if (!user) {
      return response.json({ message: "User not found" });
    }
    if (user.password !== password) {
      return response.json({ message: "Invalid credentials" });
    }
    const secretKey = process.env.SECRET_TOKEN || "";
    const token = jwt.sign(
      {
        payload: {
          userName: user.uname,
          rollNo: user.rollNo,
          department: user.department,
          course: user.course,
          role: user.role,
        },
      },
      secretKey,
    );
    return response.json({
      success: true,
      token,
      payload: {
        userName: user.uname,
        rollNo: user.rollNo,
        department: user.department,
        course: user.course,
        role: user.role,
      },
    });
  }
}
