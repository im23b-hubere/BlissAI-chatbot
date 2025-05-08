"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { Loader2, User, KeyRound, AlertCircle, Info, Bug } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [debugVisible, setDebugVisible] = useState(false)
  const [username, setUsername] = useState("demo")
  const [password, setPassword] = useState("demo")
  const [activeTab, setActiveTab] = useState("credentials")

  useEffect(() => {
    if (status === "authenticated") {
      console.log("User authenticated:", session);
      setDebugInfo("Authenticated! Redirecting to chat...");
      router.push("/chat")
    }
  }, [status, router, session])

  // If still loading, show loading state
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <motion.div 
              className="absolute inset-0 rounded-full bg-primary/10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="text-muted-foreground font-medium">Initializing BlissAI...</div>
        </motion.div>
      </div>
    )
  }

  const handleStackAuthLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      setDebugInfo("Starting Stack Auth login process...");
      console.log("Starting Stack Auth login process...");
      
      // Add a timeout to handle potential hanging during auth
      const loginTimeout = setTimeout(() => {
        setError("Login request timed out. Please try again or use credentials.");
        setIsLoading(false);
      }, 15000);
      
      // Use callbackUrl that works better with the redirect flow
      const result = await signIn("stackexchange", { 
        callbackUrl: window.location.origin + "/chat",
        redirect: false
      });
      
      clearTimeout(loginTimeout);
      
      console.log("Stack Auth result:", result);
      setDebugInfo(`Stack Auth result: ${JSON.stringify(result)}`);
      
      if (result?.error) {
        console.error("Stack Auth error:", result.error);
        setError(`Authentication failed: ${result.error}`);
        setIsLoading(false);
        return;
      }
      
      if (result?.url) {
        setDebugInfo("Redirecting to " + result.url);
        router.push(result.url);
      } else {
        setError("Something went wrong with authentication.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(`Error during login: ${error instanceof Error ? error.message : String(error)}`);
      setDebugInfo(`Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      setDebugInfo("Starting credentials login...");
      
      console.log("Attempting to sign in with credentials");
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false
      });
      
      console.log("Credentials login result:", result);
      setDebugInfo(`Credentials result: ${JSON.stringify(result)}`);
      
      if (result?.error) {
        setError("Invalid username or password");
        setIsLoading(false);
        return;
      }
      
      if (result?.ok) {
        setDebugInfo("Login successful, redirecting...");
        router.push("/chat");
      } else {
        setError("Something went wrong with authentication.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(`Error during login: ${error instanceof Error ? error.message : String(error)}`);
      setDebugInfo(`Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
      setIsLoading(false);
    }
  };

  const toggleDebugInfo = () => {
    setDebugVisible(!debugVisible);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-[400px] shadow-lg border-opacity-50 overflow-hidden">
          <CardHeader className="text-center space-y-2 pb-6 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 opacity-60 hover:opacity-100"
              onClick={toggleDebugInfo}
            >
              <Bug className="h-4 w-4" />
            </Button>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <CardTitle className="text-3xl font-bold">BlissAI</CardTitle>
            </motion.div>
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <CardDescription className="text-base">
                Sign in to start your AI conversation
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 bg-destructive/10 text-destructive rounded-md text-sm flex items-start gap-2 border border-destructive/20"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              {debugInfo && debugVisible && (
                <motion.div 
                  key="debug"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 bg-blue-500/10 text-blue-500 rounded-md text-xs flex items-start gap-2 border border-blue-500/20 max-h-[150px] overflow-auto"
                >
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="break-all font-mono">
                    <p className="font-semibold mb-1">Debug Info:</p>
                    <p>{debugInfo}</p>
                    <p className="mt-1 text-muted-foreground">Session Status: {status}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Tabs 
              defaultValue="credentials" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="credentials" className="transition-all duration-200">
                  <User className="mr-2 h-4 w-4" />
                  Credentials
                </TabsTrigger>
                <TabsTrigger value="stackauth" className="transition-all duration-200">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Stack Auth
                </TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "credentials" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "credentials" ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="credentials" className="mt-0">
                    <form onSubmit={handleCredentialsLogin} className="space-y-4">
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="demo"
                          className="transition-all duration-200"
                          required
                        />
                      </motion.div>
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="demo" 
                          className="transition-all duration-200"
                          required
                        />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <Button 
                          type="submit"
                          className="w-full mt-6 transition-all duration-300" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            <>
                              <User className="mr-2 h-4 w-4" />
                              Sign in with Credentials
                            </>
                          )}
                        </Button>
                      
                        <div className="mt-3 text-xs text-center text-muted-foreground">
                          <p>Use username: <code className="px-1 py-0.5 bg-muted rounded">demo</code> and password: <code className="px-1 py-0.5 bg-muted rounded">demo</code></p>
                        </div>
                      </motion.div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="stackauth" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <Button 
                        onClick={handleStackAuthLogin}
                        className="w-full transition-all duration-300" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Sign in with Stack Auth
                          </>
                        )}
                      </Button>
                      
                      <div className="mt-4 text-sm text-center text-muted-foreground">
                        <div className="bg-muted p-3 rounded-md">
                          <div className="font-medium mb-1">Stack Auth Project Info</div>
                          <div className="text-xs">
                            <p className="mb-1">ID: <code className="bg-background/50 px-1 py-0.5 rounded">a30ae3b8-d708-4861-8fb6-9b188945d43b</code></p>
                            <p className="text-muted-foreground/80">Secure authentication powered by Stack Auth</p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs">
                          <span className="text-yellow-500">Note:</span> If Stack Auth fails, you can use Credentials login
                        </p>
                      </div>
                    </motion.div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-2">
            <motion.div 
              className="text-sm text-center text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
} 