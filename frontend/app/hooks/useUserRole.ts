import { Role } from "@realkoder/antik-moderne-shared-types";
import { useEffect, useState } from "react";
import { useFetch } from "~/lib/api-client";

const useUserRole = () => {
    const [userRole, setUserRole] = useState<Role>(Role.USER);
    const { fetchData } = useFetch<{ role: Role }>();

    useEffect(() => {
        (async () => {
            // const userRole = await authRequestClient.user.getUserRoleForClient();
            const userRole = await fetchData("/users/auth/api/v1/role", false, { method: "POST" });
            if (userRole) {
                setUserRole(userRole.role);
            }
        })();
    }, []);

    return { userRole };
}

export default useUserRole;