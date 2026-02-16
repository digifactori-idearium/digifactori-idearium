import bcrypt from 'bcrypt';
import { prisma } from '../../config/client.config';

const profileTable = prisma.profile;
const userTable = prisma.user;

const getSingleProfile = async (userId: string, parentalCode: boolean) => {
    try {
        const include = parentalCode ? {
                followers: true,
                following: true,
                user: true
            } : {
                followers: true,
                following: true,
            }
        const profile = await profileTable.findUnique({
            where: {
                userId: userId,
            },
            include: include
        });

        if (!profile) {
            throw new Error(`User not found`);
        }
        return profile;
    } catch (error: any) {
        throw new Error(`Error fetching profil: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
};

const updateProfile = async (userId: string, body: SetProfileInput) => {
    const test = await userTable.findUnique({
        where: {
            id: "cmlppg2tn0000gsutd64l78ge"
        }
    })
    console.log("userId ", test);
    try {
        let response: {user?, profile} = {profile: {}}
        if (body.user) {
            const {password, email, first_name, last_name} = {...body.user};
            const hashedPassword: string|undefined = password ? await bcrypt.hash(password, 10) : ""
            response.user = await userTable.update({
                where: {
                    id: userId
                },
                data: {email, first_name, last_name,
                    password: hashedPassword}
            })
        }
        const {pseudo, bio, avatar} = {...body.profile};
        response.profile = await profileTable.update({
            where: {
                userId: userId,
            },
            data: { pseudo, bio, avatar },
        });
        return response;
    } catch (error: any) {
        throw new Error(`Error operating Profile: ${error.message}`);
    }
}

const verifyPassword = async (userId: string, password: string) => {
    const correctPassword = await userTable.findUnique({
        where: {
            id: userId
        }
    }).then(res => res?.password)
    console.log('mdp', password)
    console.log('correctPassword', correctPassword)
    return bcrypt.compare(password, correctPassword)
}

export { getSingleProfile, updateProfile, verifyPassword };

