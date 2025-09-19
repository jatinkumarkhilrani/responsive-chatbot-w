import { memo } from 'react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: number | Date
}

interface MessageListProps {
  messages: Message[]
  isGenerating?: boolean
  className?: string
}

export const MessageList = memo(({ messages, isGenerating = false, className = '' }: MessageListProps) => {
  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const timestamp = typeof message.timestamp === 'number' 
            ? new Date(message.timestamp) 
            : message.timestamp
          
          return (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70">
                  {timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
})

MessageList.displayName = 'MessageList'