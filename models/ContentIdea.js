import mongoose from "mongoose";
import { accountScoped } from "../lib/account-scope.js";

// guestmail: a topic the content agent proposes for a newsletter (lib/content-agent.js), and what became of it. proposed:
// waiting for the owner. approved: the agent writes it next. drafting: being written. drafted: a draft campaign exists
// (campaignId). rejected and failed end it. angle: why it fits this venue. keyword: what guests search for. sources: the
// pages the agent read for it.
export const IDEA_STATUSES = ["proposed", "approved", "rejected", "drafting", "drafted", "failed"];

const contentIdeaSchema = new mongoose.Schema(
	{
		newsletterId: { type: mongoose.Schema.Types.ObjectId, ref: "Newsletter", required: true },
		title: { type: String, required: true, maxlength: 200 },
		angle: { type: String, maxlength: 600 },
		keyword: { type: String, maxlength: 200 },
		sources: { type: [String], default: undefined },
		status: { type: String, enum: IDEA_STATUSES, required: true, default: "proposed" },
		decidedAt: { type: Date },
		campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
		attempts: { type: Number, default: 0 },
		note: { type: String, maxlength: 500 },
	},
	{ timestamps: true }
);

contentIdeaSchema.index({ accountId: 1, newsletterId: 1, status: 1, createdAt: -1 });
contentIdeaSchema.plugin(accountScoped);

export default mongoose.models.ContentIdea || mongoose.model("ContentIdea", contentIdeaSchema);
