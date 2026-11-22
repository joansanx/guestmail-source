import mongoose from "mongoose";
import { accountScoped } from "../lib/account-scope.js";
import { BRANCHES, CONDITION_CHECKS, STEP_TYPES, TRIGGER_TYPES, WAIT_UNITS } from "../lib/automation-rules.js";

// guestmail: a series of emails that goes out on its own (lib/automation-runs.js). trigger: who starts it. steps: its path
// as lib/automation-rules.js checks it, each step in the lane of the condition branch it follows (parent and branch). An
// email step's words are a campaign of its own (Campaign.automation), written in the campaign editor. problem: why its
// last send failed, for its page.
const stepSchema = new mongoose.Schema(
	{
		id: { type: String, required: true },
		type: { type: String, enum: STEP_TYPES, required: true },
		parent: { type: String },
		branch: { type: String, enum: BRANCHES },
		campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
		amount: { type: Number },
		unit: { type: String, enum: WAIT_UNITS },
		check: { type: String, enum: CONDITION_CHECKS },
		email: { type: String },
		tag: { type: String },
		segmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Segment" },
	},
	{ _id: false, id: false }
);

const automationSchema = new mongoose.Schema(
	{
		newsletterId: { type: mongoose.Schema.Types.ObjectId, ref: "Newsletter", required: true },
		name: { type: String, trim: true, required: true },
		template: { type: String },
		trigger: {
			type: { type: String, enum: TRIGGER_TYPES, required: true },
			tag: { type: String },
			campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
		},
		steps: { type: [stepSchema], default: [] },
		enabled: { type: Boolean, default: false },
		enabledAt: { type: Date },
		problem: { type: String },
	},
	{ timestamps: true }
);

automationSchema.plugin(accountScoped);
automationSchema.index({ accountId: 1, newsletterId: 1, createdAt: -1 });
// The automations an event starts, and the hourly run's, across accounts.
automationSchema.index({ newsletterId: 1, "trigger.type": 1 }, { partialFilterExpression: { enabled: true } });
automationSchema.index({ enabled: 1 }, { partialFilterExpression: { enabled: true } });

export default mongoose.models.Automation || mongoose.model("Automation", automationSchema);
