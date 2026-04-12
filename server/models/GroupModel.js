const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({

    groupName: {
        type: String,
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    image: {
        type: String,
        default: ""
    },

    joinCode: {
        type: String,
        unique: true
    },

    destination: {
        type: String,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    maxMembers: {
        type: Number,
        default: 1
    },

    members: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            role: {
                type: String,
                enum: ["admin", "member"],
                default: "member"
            }
        }
    ],

    type: {
        type: String,
        enum: ["solo", "group"],
        default: "solo"
    },

    proposals: [
        {
            text: String,

            type: {
                type: String,
                enum: ["modify","add","remove"]
            },

            target: String,
            after: String,

            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },

            status: {
                type: String,
                default: "pending"
            },

            upvotes: [],
            downvotes: []
        }
    ],

    // 🔥 ITINERARY
    itinerary: [
        {
            day: Number,
            date: String,
            title: String,
            subtitle: String,
            activities: [
                {
                    time: String,
                    title: String,
                    description: String
                }
            ]
        }
    ]

}, { timestamps: true });


groupSchema.pre("save", function() {
    if (this.maxMembers > 1) {
        this.type = "group";
    } else {
        this.type = "solo";
    }
});

module.exports = mongoose.model("Group", groupSchema);