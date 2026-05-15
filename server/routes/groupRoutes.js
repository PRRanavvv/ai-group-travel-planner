const express = require("express");
const router = express.Router();

const {
    createGroup,
    joinGroup,
    getMyGroups,
    getJoinCode,
    getGroupById,
    applyProposalsAndRegenerate,
    addProposal,
    voteProposal,
    approveProposal,
    previewProposal,
    rejectProposal,
    applyApprovedProposals
} = require("../controllers/groupController");

const protect = require("../middleware/authMiddleware.js");

router.post("/create", protect, createGroup);
router.post("/join", protect, joinGroup);
router.get("/my-groups", protect, getMyGroups);
router.get("/:id/code", protect, getJoinCode);
router.get("/:id", getGroupById);

// ✅ NEW ROUTES
router.post("/:id/proposal", protect, addProposal);
router.post("/:id/vote", protect, voteProposal);
router.post("/:id/approve", protect, approveProposal);
router.post("/:id/regenerate", protect, applyProposalsAndRegenerate);
router.post("/:id/apply", applyApprovedProposals);
router.post("/:id/preview", previewProposal);
router.post("/:id/reject", rejectProposal)

module.exports = router;