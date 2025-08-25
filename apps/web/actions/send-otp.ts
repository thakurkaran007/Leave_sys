"use server";

import { getUserByEmail } from "@/data/user";
import { sendOtp } from "@/lib/mail";
import { validateCaptcha } from "@/lib/validateCaptcha";

export const send = async (email: string, token: string) => {

    try {
        // const validateCap = await validateCaptcha(token);
        // if (!validateCap) {
        //     return { error: "Captcha Validation Failed" };
        // }
        if (await getUserByEmail(email)) {
            return { error: "Email already in use" };
        }

        await sendOtp(email);
        return { success: "OTP sent" };
    } catch (error) {
        return { error: "Something went wrong" };
    }
};
