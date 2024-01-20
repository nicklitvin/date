import { User } from "@prisma/client";

export function doesUniversityMatchEmail(user : User) {
    const isEdu = user.email.endsWith(".edu");
    const emailUniversity = user.email.split("@")[1].split(".edu")[0];
    
    return isEdu && emailUniversity === user.university;
}