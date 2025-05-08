import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateChatCompletion(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    return {
      content: response.choices[0].message.content,
      usage: response.usage
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error('Failed to generate chat completion')
  }
} 