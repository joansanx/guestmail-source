import mongoose from "mongoose";
import { accountScoped } from "../lib/account-scope.js";

// guestmail: each exact privacy notice a venue's forms have shown (lib/consent-proof.js), kept once per newsletter and
// named by its hash. A contact's consentNotice.hash points here: what the person read when they subscribed (RGPD 7.1).
const consentTextSchema = new mongoose.Schema(
	{
		newsletterId: { type: mongoose.Schema.Types.ObjectId, ref: "Newsletter", required: true },
		hash: { type: String, required: true },
		text: { type: String, required: true },
		language: { type: String },
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

consentTextSchema.plugin(accountScoped);
consentTextSchema.index({ newsletterId: 1, hash: 1 }, { unique: true });

export default mongoose.models.ConsentText || mongoose.model("ConsentText", consentTextSchema);
