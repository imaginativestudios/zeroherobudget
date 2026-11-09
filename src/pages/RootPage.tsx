import { useBetaAccess } from "@/hooks/useBetaAccess";
import Landing from "./Landing";

const RootPage = () => {
  // Beta access state is still tracked; the public landing is shown to everyone.
  useBetaAccess();
  return <Landing />;
};

export default RootPage;
