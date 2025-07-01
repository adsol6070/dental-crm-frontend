import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
// import { PermissionProvider } from "@/context/PermissionContext";

const queryClient = new QueryClient();

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* <PermissionProvider> */}
        {children}
        {/* </PermissionProvider> */}
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
