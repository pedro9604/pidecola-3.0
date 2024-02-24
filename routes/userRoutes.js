const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");

// GETs
router.get("/", userController.getUserInformation);

// POSTs
router.post("/", userController.create);
router.post("/code", userController.codeValidate);

// PUTs
router.put("/", userController.updateUser);
// router.put('/update/picture', upload.single('file'), userController.updateProfilePic)
// router.put('/add/vehicle', upload.single('file'), userController.addVehicle)

module.exports = router;
