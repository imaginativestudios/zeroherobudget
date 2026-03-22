import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Landing from "./Landing";
import ComingSoon from "./ComingSoon";

const BETA_KEY = "beta_access";

const RootPage = () => {
  const [searchParams] = useSearchParams();
  const [isBeta, setIsBeta] = useState(() => localStorage.getItem(BETA_KEY) === "true");

  useEffect(() => {
    const betaParam = searchParams.get("beta");
    if (betaParam === "true") {
      localStorage.setItem(BETA_KEY, "true");
      setIsBeta(true);
    } else if (betaParam === "false") {
      localStorage.removeItem(BETA_KEY);
      setIsBeta(false);
    }
  }, [searchParams]);

  return isBeta ? <Landing /> : <ComingSoon />;
};

export default RootPage;
