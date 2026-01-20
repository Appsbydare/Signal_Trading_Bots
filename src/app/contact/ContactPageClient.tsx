"use client";

import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export default function ContactPageClient() {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8 pt-10"
        >
            <motion.h1 variants={fadeInUp} className="reveal brand-heading text-2xl font-semibold tracking-tight">Contact</motion.h1>
            <div className="space-y-4">
                <motion.p variants={fadeInUp} className="reveal max-w-2xl text-sm text-zinc-400">
                    We typically respond within 1–2 business days.
                </motion.p>
                <motion.div variants={fadeInUp} className="rounded-lg border border-[#5e17eb] bg-white/95 p-4 text-sm shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
                    <p className="mb-2 font-medium text-[var(--text-main)]">Email support</p>
                    <a
                        href="mailto:support@signaltradingbots.com"
                        className="inline-block rounded-md bg-[#5e17eb] px-3 py-2 !text-white shadow-sm transition hover:bg-[#4512c2] hover:scale-105 hover:shadow-lg"
                    >
                        support@signaltradingbots.com
                    </a>
                </motion.div>
                <motion.div variants={fadeInUp} className="rounded-lg border border-[#5e17eb] bg-white/95 p-4 text-sm shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
                    <p className="mb-2 font-medium text-[var(--text-main)]">Google Form</p>
                    <p className="mb-3 text-zinc-600">
                        Share your Google Form link and we will wire this button to submit
                        directly to your form.
                    </p>
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSclVvR_Rwz-kdAUdbBRsIr2FxVn2n2RkCY0UP-oLjaLlCAIuA/viewform?usp=header"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md bg-[#5e17eb] px-4 py-2 !text-white shadow-sm transition hover:bg-[#4512c2] hover:scale-105 hover:shadow-lg"
                    >
                        Open Contact Form
                    </a>
                </motion.div>
            </div>
            <motion.p variants={fadeInUp} className="text-xs text-zinc-400">
                Anti-spam protected. By submitting this form, you agree to our Terms and
                acknowledge our Privacy Policy.
            </motion.p>
        </motion.div>
    );
}
