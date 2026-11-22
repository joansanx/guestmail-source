import mongoose from "mongoose";
import { accountScoped } from "../lib/account-scope.js";
import { BRANCHES } from "../lib/automation-rules.js";

// guestmail: one person on an automation's path (lib/automation-runs.js), once per automation ever. active: at stepId
// since stepAt, due again at nextAt. done: the path ended. left: they stopped getting emails, or their step was removed
// (reason). history: each step they went through, with the branch a condition sent them down.
const automationRunSchema = new mongoose.Schema(
	{
		newsletterId: { type: mongoose.Schema.Types.ObjectId, ref: "Newsletter", required: true },
		automationId: { type: mongoose.Schema.Types.ObjectId, ref: "Automation", required: true },
		contactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
		status: { type: String, enum: ["active", "done", "left"], required: true },
		stepId: { type: String },
		stepAt: { type: Date },
		nextAt: { type: Date },
		history: [
			{
				_id: false,
				stepId: { type: String, required: true },
				branch: { type: String, enum: BRANCHES },
				at: { type: Date, required: true },
			},
		],
		reason: { type: String },
		finishedAt: { type: Date },
	},
	{ timestamps: true }
);

automationRunSchema.plugin(accountScoped);
automationRunSchema.index({ automationId: 1, contactId: 1 }, { unique: true });
automationRunSchema.index({ automationId: 1, status: 1, nextAt: 1 });
automationRunSchema.index({ automationId: 1, createdAt: -1 });
automationRunSchema.index({ accountId: 1, contactId: 1 });

export default mongoose.models.AutomationRun || mongoose.model("AutomationRun", automationRunSchema);
