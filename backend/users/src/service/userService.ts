import { UserJSON } from "@clerk/backend";
import { prismaUsers } from "../db/database.js";
import { Role, UserResponse } from "../../types/user.interface.js";

export interface Response {
    success: boolean;
    message?: string;
    result?: string | number;
  }

const UserService = {
    count: async (): Promise<number> => {
        return await prismaUsers.user.count();
    },

    create: async (event: UserJSON): Promise<{ status: string }> => {
        const userNormalized = {
            id: event.id,
            external_id: event.external_id ?? "",
            first_name: event.first_name ?? "",
            last_name: event.last_name ?? "",
            username: event.username ?? "",
            image_url: event.image_url,
            primary_email_address_id: event.email_addresses[0].email_address ?? "",
            created_at: new Date(event.created_at),
            last_sign_in_at: event.last_sign_in_at ? new Date(event.last_sign_in_at) : null,
            updated_at: new Date(event.updated_at),
        };

        try {
            const user = await prismaUsers.$transaction(async (prisma) => {
                const user = await prismaUsers.user.create({ data: userNormalized });

                const emailAddressesPromises = event.email_addresses.map(emailAddress =>
                    prisma.emailAddresses.create({
                        data: {
                            id: emailAddress.id,
                            user_id: user.id,
                            email_address: emailAddress.email_address,
                        }
                    })
                );

                const userPrivilegeRolePromise = prisma.privilegeRole.create({
                    data: { user_id: user.id, role: Role.USER }
                });

                await Promise.all([...emailAddressesPromises, userPrivilegeRolePromise]);

                return user;
            });

            return {
                status: "OK",
            };
        } catch (error) {
            console.error("Transactional usercreation failed: ", error);

            return {
                status: "failed"
            };
        }
    },

    update: async (id: string, event: UserJSON): Promise<UserResponse> => {
        try {
            const userNormalized = {
                id: event.id,
                external_id: event.external_id ?? "",
                first_name: event.first_name ?? "",
                last_name: event.last_name ?? "",
                username: event.username ?? "",
                image_url: event.image_url,
                primary_email_address_id: event.email_addresses[0].email_address ?? "",
                created_at: new Date(event.created_at),
                last_sign_in_at: event.last_sign_in_at ? new Date(event.last_sign_in_at) : null,
                updated_at: new Date(event.updated_at),
            };
            const updateUser = await prismaUsers.user.update({
                where: { id: id },
                data: userNormalized,
            });

            return {
                success: true,
                result: {
                    ...updateUser,
                    email_addresses: []
                },
            };
        } catch (error) {
            return {
                success: false,
                message: "User not found",
            };
        }
    },

    findByEmail: async (email: string): Promise<UserResponse> => {
        const user = await prismaUsers.user.findFirst({
            where: {
                primary_email_address_id: email
            },
        });

        if (!user) {
            return {
                success: false,
                message: "User not found",
            };
        }

        return {
            success: true,
            message: `USER IS FOUND`,
            result: {
                ...user,
                email_addresses: [] // Fix this later if needed
            },
        };
    },

    findOne: async (userId: string): Promise<UserResponse> => {
        const user = await prismaUsers.user.findFirst({
            where: { id: userId }
        });

        if (!user) {
            return {
                success: false,
                message: "User not found",
            };
        }

        return {
            success: true,
            message: `USER IS FOUND`,
            result: {
                ...user,
                email_addresses: []
            },
        };
    },

    delete: async (userId: string): Promise<Response> => {
        try {
            await prismaUsers.$transaction([
                prismaUsers.emailAddresses.deleteMany({
                    where: { user_id: userId },
                }),
                prismaUsers.privilegeRole.deleteMany({
                    where: { user_id: userId },
                }),
                prismaUsers.user.delete({
                    where: { id: userId },
                }),
            ]);

            return {
                success: true,
                result: "User deleted successfully",
            };
        } catch (error) {
            return {
                success: false,
                message: "User not found or delete operation failed",
            };
        }
    },

    getUserRoleById: async (userId: string): Promise<Role> => {
        const privilegeRole = await prismaUsers.privilegeRole.findFirst({ where: { user_id: userId } });
        return privilegeRole?.role as Role;
    },
};

export default UserService;