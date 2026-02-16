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
}

const updateProfile = async (userId: string, body: SetProfileInput) => {
    try {
        let response: {user?, profile} = {profile: {}}
        if (body.user) {
            const {email, first_name, last_name, password, parental_code} = {...body.user};
            response.user = await userTable.update({
                where: {
                    id: userId
                },
                data: {email, first_name, last_name, password, parental_code}
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

export { getSingleProfile, updateProfile };

