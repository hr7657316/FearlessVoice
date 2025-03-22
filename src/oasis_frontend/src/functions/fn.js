import { oasis_backend } from "../../../declarations/oasis_backend";

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function validateAadhaar(aadhaarNumber) {
    const aadhaarPattern = /^\d{12}$/;
    return aadhaarPattern.test(aadhaarNumber);
}

async function isAdmin(phone) {
    // First check localStorage for admin status
    if (typeof localStorage !== 'undefined' && localStorage.auth) {
        try {
            const authData = JSON.parse(localStorage.auth);
            if (authData.userInfo && authData.userInfo.isAdmin === true) {
                return true;
            }
        } catch (e) {
            console.error("Error parsing auth data", e);
        }
    }
    
    // Fall back to the phone check if needed
    var resp = await oasis_backend.getAdmin();
    if (resp == phone) {
        return true;
    }
    return false;
}

export { getRandomInt, validateAadhaar, isAdmin }