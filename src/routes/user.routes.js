import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// // In user.routes.js
// router.post('/test-upload', upload.fields([{ name: 'avatar', maxCount: 1 }]), (req, res) => {
//   console.log("FILES:", req.files);
//   console.log("BODY:", req.body);
//   res.send("Upload success");
// });

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route('/login').post(loginUser)

//secured routes

router.route('/logout').post(verifyJWT, logoutUser)

export default router