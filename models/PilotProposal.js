import mongoose from "mongoose";
import { accountScoped } from "../lib/account-scope.js";

// guestmail: one campaign the autopilot prepared from a venue's confirmed menu (lib/pilot.js), one per cycle of its
// owner's rhythm: cycleKey is the cycle's first day, unique for a newsletter. writing: its draft is being written, or
// waits for another try (attempts so far, claimedAt when the last one started). proposed: its draft campaign (campaignId) waits for the owner, who got
// its link by email. approved: the owner said yes and it's scheduled (scheduledAt). rejected: the owner said no.
// expired: the next cycle came with no answer. discarded: no draft passed the fact gate or the content check. items:
// the names it features, which the next proposals leave out. notes: why each draft that didn't make it was dropped.
export const PROPOSAL_STATUSES = ["writing", "proposed", "approved", "rejected", "expired", "discarded"];

const pilotProposalSchema = new mongoose.Schema(
	{
		newsletterId: { type: mongoose.Schema.Types.ObjectId, ref: "Newsletter", required: true },
		cycleKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
		status: { type: String, enum: PROPOSAL_STATUSES, required: true, default: "writing" },
		attempts: { type: Number, default: 0 },
		claimedAt: { type: Date },
		campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
		subject: { type: String, maxlength: 200 },
		items: { type: [String], default: undefined },
		notes: { type: [String], default: undefined },
		decidedAt: { type: Date },
		decidedVia: { type: String, enum: ["link", "dashboard", "api", "mcp"] },
		scheduledAt: { type: Date },
	},
	{ timestamps: true }
);

pilotProposalSchema.index({ accountId: 1, newsletterId: 1, cycleKey: 1 }, { unique: true });
pilotProposalSchema.index({ accountId: 1, newsletterId: 1, createdAt: -1 });
pilotProposalSchema.plugin(accountScoped);

export default mongoose.models.PilotProposal || mongoose.model("PilotProposal", pilotProposalSchema);
