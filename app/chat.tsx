'use client'

import type { ChatUIMessage } from '@/components/chat/types'
import { DEFAULT_MODEL, TEST_PROMPTS, SUPPORTED_MODELS } from '@/ai/constants'
import { MessageCircleIcon, SendIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Message } from '@/components/chat/message'
import { MoonLoader } from 'react-spinners'
import { Panel, PanelHeader } from '@/components/panels/panels'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createParser, useQueryState } from 'nuqs'
import { toast } from 'sonner'
import { mutate } from 'swr'
import { useChat } from '@ai-sdk/react'
import { useDataStateMapper } from './state'
import { useLocalStorageValue } from '@/lib/use-local-storage-value'
import { useEffect, useRef } from 'react'

interface Props {
  className: string
  modelId?: string
}

export function Chat({ className }: Props) {
  const [modelId, setModelId] = useQueryState('modelId', modelParser)
  const [input, setInput] = useLocalStorageValue('prompt-input')
  const mapDataToState = useDataStateMapper()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, status } = useChat<ChatUIMessage>({
    onToolCall: () => mutate('/api/auth/info'),
    onData: mapDataToState,
    onError: (error) => {
      toast.error(`Communication error with the AI: ${error.message}`)
      console.error('Error sending message:', error)
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const validateAndSubmitMessage = (text: string) => {
    if (text.trim()) {
      sendMessage({ text }, { body: { modelId } })
      setInput('')
    }
  }

  return (
    <Panel className={className}>
      <PanelHeader>
        <div className="flex items-center font-mono uppercase font-semibold">
          <MessageCircleIcon className="mr-2 w-4" />
          Chat
        </div>
        <div className="ml-auto text-xs opacity-50 font-mono">[{status}]</div>
      </PanelHeader>

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground font-mono">
            <p className="flex items-center font-semibold">
              Click and try one of these prompts:
            </p>
            <ul className="p-4 space-y-1 text-center">
              {TEST_PROMPTS.map((prompt, idx) => (
                <li
                  key={idx}
                  className="border border-dashed border-border rounded-sm cursor-pointer py-2 px-4 shadow-sm hover:bg-secondary/50 hover:text-primary"
                  onClick={() => validateAndSubmitMessage(prompt)}
                >
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      <form
        className="card sticky bottom-0 left-0 right-0 mx-2 mb-2 flex gap-2 p-3 items-center backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-neutral-900/40"
        onSubmit={async (event) => {
          event.preventDefault()
          validateAndSubmitMessage(input)
        }}
      >
        <ModelSelector
          modelId={modelId}
          onModelChange={(newModelId: string) => {
            setModelId(newModelId)
          }}
        />
        
        {/* Quick actions */}
        <ul className="hidden md:flex gap-2 mr-2">
          {['Create a SaaS landing page', 'Add a pricing section', 'Generate a Next.js blog', 'Explain this error'].map((q) => (
            <li key={q}>
              <button
                type="button"
                className="px-3 py-1 text-xs rounded-full border hover:bg-black/5 dark:hover:bg-white/10 transition"
                onClick={() => setInput(q)}
                title="Insert into input"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
<Input
          className="w-full text-sm bg-transparent font-mono rounded-xl focus:outline-none"
          disabled={status === 'streaming' || status === 'submitted'}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          value={input}
        />
        <Button className="btn-primary" type="submit" disabled={status !== 'ready' || !input.trim()}>
          {status === 'streaming' || status === 'submitted' ? (
            <MoonLoader color="currentColor" size={16} />
          ) : (
            <SendIcon className="w-4 h-4" />
          )}
        </Button>
      </form>
    </Panel>
  )
}

const modelParser = createParser({
  parse: (value) => (SUPPORTED_MODELS.includes(value) ? value : DEFAULT_MODEL),
  serialize: (value) => value,
}).withDefault(DEFAULT_MODEL)
