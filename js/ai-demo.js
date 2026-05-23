/**
 * AI Demo — live OpenAI scenario generator for slide 20.
 * Reads OPENAI_API_KEY from window.__ENV (injected by env.js).
 * Falls back gracefully if no key is present.
 */

const SYSTEM_PROMPT = `You are an XR training experience designer at BSD XR.
When given an industry and training need, output a concise XR training scenario spec.

Format your response as structured sections using these exact headers:
SCENARIO TITLE
LEARNING OBJECTIVE
XR MODALITY
ENVIRONMENT
KEY INTERACTIONS (3 bullet points)
ASSESSMENT METHOD
ESTIMATED SESSION LENGTH

Keep each section to 1-2 lines. Be specific and technical. No filler.`

/**
 * Wire up the AI demo on slide 20.
 * Safe to call multiple times — idempotent.
 */
export function initAIDemo() {
  const input  = document.getElementById('ai-prompt')
  const btn    = document.getElementById('ai-generate-btn')
  const output = document.getElementById('ai-demo-output')
  const status = document.getElementById('ai-demo-status')

  if (!input || !btn || !output) return
  if (btn.dataset.wired) return
  btn.dataset.wired = '1'

  btn.addEventListener('click', () => run())
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') run()
  })

  async function run() {
    const prompt = input.value.trim()
    if (!prompt) {
      setStatus('ENTER A PROMPT FIRST')
      return
    }

    const apiKey = window.__ENV?.OPENAI_API_KEY
    if (!apiKey || apiKey === 'your-key-here') {
      output.innerHTML = ''
      setStatus('NO API KEY — ADD YOUR KEY TO .env AND RELOAD')
      return
    }

    btn.disabled  = true
    btn.textContent = 'GENERATING...'
    output.innerHTML = ''
    setStatus('CALLING OPENAI...')

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: prompt },
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''
      renderOutput(text)
      setStatus('')
    } catch (err) {
      output.innerHTML = ''
      setStatus(`ERROR — ${err.message}`)
    } finally {
      btn.disabled = false
      btn.textContent = 'GENERATE'
    }
  }

  function renderOutput(text) {
    output.innerHTML = ''
    const lines = text.trim().split('\n').filter(l => l.trim())

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Section headers (all caps, no leading dash)
      const isHeader = /^[A-Z][A-Z\s\/()]+$/.test(trimmed) && !trimmed.startsWith('—') && !trimmed.startsWith('-')

      const el = document.createElement('div')
      if (isHeader) {
        el.className = 'ai-out-header'
        el.textContent = trimmed
      } else {
        el.className = 'ai-out-line'
        el.textContent = trimmed.replace(/^[-—•]\s*/, '— ')
      }
      output.appendChild(el)
    }
  }

  function setStatus(msg) {
    status.textContent = msg
  }
}
