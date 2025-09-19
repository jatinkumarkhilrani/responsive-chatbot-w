import { memo, useCallback } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { Trash, Users } from '@phosphor-icons/react'
import { useAppStore } from '../store/appStore'
import { Button } from './ui/button'

export const ChatList = memo(() => {
  const { chats, currentChatId, setCurrentChat, deleteChat, setSidebarOpen } = useAppStore()

  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChat(chatId)
    setSidebarOpen(false) // Close sidebar on mobile
  }, [setCurrentChat, setSidebarOpen])

  const handleDeleteChat = useCallback((e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId)
    }
  }, [deleteChat])

  const formatLastActivity = useCallback((timestamp: number) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return 'Yesterday'
    } else {
      return format(date, 'MMM d')
    }
  }, [])

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">
          No chats yet. Start a new conversation!
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => handleSelectChat(chat.id)}
          className={`
            flex items-center gap-3 p-4 cursor-pointer border-b border-border
            hover:bg-accent transition-colors group
            ${currentChatId === chat.id ? 'bg-accent' : ''}
          `}
        >
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            {chat.type === 'group' ? (
              <Users className="w-5 h-5 text-primary" />
            ) : (
              <div className="w-6 h-6 bg-primary rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground truncate">
                {chat.title}
              </h3>
              <span className="text-xs text-muted-foreground">
                {formatLastActivity(chat.lastActivity)}
              </span>
            </div>
            
            {chat.lastMessage && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {chat.lastMessage}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {chat.messageCount} messages
              </span>
              {chat.type === 'group' && (
                <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">
                  Group
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDeleteChat(e, chat.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  )
})