import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Message as MessageType } from "@prisma/client"
import ReactMarkdown from "react-markdown"
import { User, Bot, Copy, CheckCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user"
  const [isCopied, setIsCopied] = useState(false)
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const formattedDate = format(new Date(message.createdAt), 'HH:mm');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex w-full items-start gap-4 p-4 rounded-xl",
        isUser 
          ? "bg-muted/50 border border-muted-foreground/10" 
          : "bg-background border border-primary/10"
      )}
    >
      <Avatar className={cn(
        "h-9 w-9 ring-2 transition-all duration-300",
        isUser ? "ring-primary/20" : "ring-secondary/20",
        "group-hover:ring-primary group-hover:ring-secondary"
      )}>
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full",
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
      </Avatar>
      
      <div className="flex-1 space-y-2 overflow-hidden min-w-0">
        <div className="flex items-center justify-between mb-1 text-sm">
          <span className="font-medium">
            {isUser ? "You" : "BlissAI"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formattedDate}
          </span>
        </div>
        
        <div className="prose prose-neutral dark:prose-invert max-w-full">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      borderRadius: "1rem",
                      fontSize: "0.95em",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                      margin: "0.5rem 0"
                    } as React.CSSProperties}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    style={{
                      background: "#f4f4f4",
                      borderRadius: "6px",
                      padding: "2px 6px",
                      fontSize: "0.95em"
                    } as React.CSSProperties}
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={copyToClipboard}
            >
              {isCopied ? (
                <CheckCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCopied ? "Copied!" : "Copy message"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
} 