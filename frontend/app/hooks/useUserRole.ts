import { Role } from "@realkoder/antik-moderne-shared-types";
import { useEffect, useState } from "react";
import { useFetch } from "~/lib/api-client";

const useUserRole = () => {
    const [userRole, setUserRole] = useState<Role>(Role.USER);
    const { fetchData } = useFetch<{ role: Role }>();

    useEffect(() => {
        (async () => {
            // const userRole = await authRequestClient.user.getUserRoleForClient();
            try {
                const userRole = await fetchData("/users/auth/api/v1/role", { method: "POST" });
                console.log("USER", userRole);
                if (userRole) {
                    setUserRole(userRole.role);
                }
            } catch (e) {
                console.log("CAUGHT U", e);
                setUserRole(Role.USER);
            }
        })();
    }, []);

    return { userRole };
}

export default useUserRole;