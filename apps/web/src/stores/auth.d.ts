interface AuthUser {
    id: string;
    email: string;
    name: string | null;
}
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", Pick<{
    token: import("vue").Ref<string | null, string | null>;
    user: import("vue").Ref<{
        id: string;
        email: string;
        name: string | null;
    } | null, AuthUser | {
        id: string;
        email: string;
        name: string | null;
    } | null>;
    loading: import("vue").Ref<boolean, boolean>;
    isLoggedIn: import("vue").ComputedRef<boolean>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    fetchProfile: () => Promise<void>;
}, "token" | "user" | "loading">, Pick<{
    token: import("vue").Ref<string | null, string | null>;
    user: import("vue").Ref<{
        id: string;
        email: string;
        name: string | null;
    } | null, AuthUser | {
        id: string;
        email: string;
        name: string | null;
    } | null>;
    loading: import("vue").Ref<boolean, boolean>;
    isLoggedIn: import("vue").ComputedRef<boolean>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    fetchProfile: () => Promise<void>;
}, "isLoggedIn">, Pick<{
    token: import("vue").Ref<string | null, string | null>;
    user: import("vue").Ref<{
        id: string;
        email: string;
        name: string | null;
    } | null, AuthUser | {
        id: string;
        email: string;
        name: string | null;
    } | null>;
    loading: import("vue").Ref<boolean, boolean>;
    isLoggedIn: import("vue").ComputedRef<boolean>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    fetchProfile: () => Promise<void>;
}, "login" | "register" | "logout" | "fetchProfile">>;
export {};
