import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async(userId)=>
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false })

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh token")
    }
}

const registerUser = asyncHandler( async (req, res) =>{
    //Get the details of user from frontend
    //validate the details
    //check if the user with email or username is already present: username, email
    //Check for images, check for avatar
    //Upload them to cloudinary, avatar
    //Create user object - entry in database 
    //Remove password and refresh token field from response
    //Check for user creation
    //Send the response

    const { fullName, email, username, password } = req.body
    console.log("email: ", email);
    
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existingUser){
        throw new ApiError(409, "User with email or username already exists.")
    }

    console.log("Received files:", req.files);
    console.log("Received body:", req.body);

    const avatar = req?.files?.avatar?.[0];
    const coverImage = req?.files?.coverImage?.[0]; // optional if used

    if (!avatar) {
    return res.status(400).json({ error: "Avatar is required" });
    }

    // Access file path like this:
    const avatarPath = avatar.path;
    const coverImagePath = coverImage.path
    console.log("Avatar uploaded at:", avatarPath);

    // const avatarLocalPath = req?.files?.avatar?.[0].path;
    // const coverImageLocalPath = req?.files?.coverImage?.[0].path;

    // if(!avatarLocalPath){
    //     throw new ApiError(400, "Avatar file is required");
    // }

    const avatarUpload = await uploadOnCloudinary(avatarPath)
    const coverImageUpload = await uploadOnCloudinary(coverImagePath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatarUpload.url,
        coverImage: coverImageUpload?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
} )

const loginUser = asyncHandler( async (req, res) =>{
    //Get the input from frontend
    //Check if user has inputted necessary fields
    //Check if the user with the input username or email exists in database
    //Password check
    //After logging in generate their access and refresh tokens
    //Send cookies
    //Whenever the time of access token gets over, we have check the user's refreshToken with database
    const {email, username, password} = req.body

    if(!username && !email){
        throw new ApiError(400, "Username or Email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
} )

const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

export { 
    registerUser,
    loginUser,
    logoutUser 
}