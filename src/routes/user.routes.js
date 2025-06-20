import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
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
router.route('/refresh-token').post(refreshAccessToken)

router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateAccountDetails)

router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar)
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)

router.route('/c/:username').get(verifyJWT, getUserChannelProfile)

router.route('/history').get(verifyJWT, getWatchHistory)

export default router