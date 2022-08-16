const express = require('express')
const {isAuthUser,isAuthRole} = require('../middlewares/auth')
const {registerUser,loginUser,logoutUser,forgotPassword, resetPassword, getUserProfile, updateUserPassword, updateUserProfile,updateMyProfile, allUsers, userProfile, deleteUser } = require('../controllers/authController')

const router = express.Router()


router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)
router.post('/password/forgot',forgotPassword)
router.put('/password/reset/:token',resetPassword )
router.get('/me',isAuthUser,getUserProfile)
router.put('/password/update',isAuthUser,updateUserPassword)
router.put('/me/update',isAuthUser,updateMyProfile)
router.get('/admin/allprofiles',isAuthUser,isAuthRole('admin'), allUsers)
router.get('/admin/user/:id',isAuthUser,isAuthRole('admin'),userProfile)
router.put('/admin/update/user/:id',isAuthUser,isAuthRole('admin'),updateUserProfile)
router.delete('/admin/delete/user/:id',isAuthUser,isAuthRole('admin'),deleteUser)








module.exports = router