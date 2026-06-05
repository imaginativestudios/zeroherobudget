import { useBetaAccess } from "@/hooks/useBetaAccess";
import Landing from "./Landing";
import ComingSoon from "./ComingSoon";

const RootPage = () => {
  const { isBeta } = useBetaAccess();
  return isBeta ? <Landing /> : <ComingSoon />;
};

export default RootPage;
