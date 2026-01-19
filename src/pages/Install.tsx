import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Smartphone, Share, Plus, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
const Install = () => {
  const {
    isInstallable,
    isInstalled,
    promptInstall,
    isIOS,
    showIOSInstructions
  } = usePWAInstall();
  const handleInstall = async () => {
    await promptInstall();
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
          <Logo className="h-8" />
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center text-white space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
              <Smartphone className="h-10 w-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Install Zero Hero
            </h1>
            <p className="text-lg text-white/80 max-w-md mx-auto">
              Get the full app experience on your device. Works offline and loads instantly!
            </p>
          </div>

          {/* Already Installed */}
          {isInstalled && <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Already Installed!</h3>
                  <p className="text-green-700">
                    Zero Hero is installed on your device. Open it from your home screen for the best experience.
                  </p>
                </div>
              </CardContent>
            </Card>}

          {/* Install Button (Android/Desktop) */}
          {isInstallable && !isInstalled && <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  One-Click Install
                </CardTitle>
                <CardDescription>
                  Install Zero Hero directly to your device
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button size="lg" onClick={handleInstall} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8">
                  <Download className="mr-2 h-5 w-5" />
                  Install Zero Hero
                </Button>
              </CardContent>
            </Card>}

          {/* iOS Instructions */}
          {showIOSInstructions && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Install on iPhone/iPad
                </CardTitle>
                <CardDescription>
                  Follow these steps to add Zero Hero to your home screen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground">
                      Look for the <Share className="inline h-4 w-4" /> icon at the bottom of your Safari browser
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                    <p className="text-sm text-muted-foreground">
                      You may need to scroll down to find this option <Plus className="inline h-4 w-4" />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Tap "Add"</p>
                    <p className="text-sm text-muted-foreground">
                      Confirm to add Zero Hero to your home screen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>}

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Why Install?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Works Offline</strong> - Access your budget data even without internet</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Faster Loading</strong> - Opens instantly like a native app</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Full Screen</strong> - No browser bars, just your budget</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Home Screen Icon</strong> - Launch with one tap</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Back to App */}
          <div className="text-center">
            <Link to="/dashboard">
              <Button variant="inverse-outline">
                Continue to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export default Install;